/**
 * 지역명 다국어 업데이트 스크립트
 *
 * DB에 있는 지역명 데이터를 언어별로 업데이트하는 메인 스크립트
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../../lib/prisma';
import type { Locale, DistrictData, UpdateProgress, UpdateResult, CliOptions } from './types';
import { parseCliOptions, validateAndLogOptions } from './cli-options';
import {
  ensureDirForFile,
  formatTimestampForFileName,
  saveUpdateProgress,
  loadUpdateProgress,
  mergeLocalizedText,
  getKoreanText,
} from './utils';

// 테스트 모드 설정
const TEST_MODE = false;
const TEST_MAX_ITEMS = 1; // 테스트 모드일 때 처리할 최대 항목 수

// 진행 상황 파일 경로
const PROGRESS_FILE_BASE = path.join(__dirname, 'output', 'update-progress');

/**
 * DB에서 지역 데이터 조회
 */
async function fetchDistricts(options: {
  limit?: number | null;
  batchSize: number;
  cursorId?: string | null;
}): Promise<DistrictData[]> {
  const { limit, batchSize, cursorId } = options;

  const take = limit ? Math.min(batchSize, limit) : batchSize;

  const districts = await prisma.district.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      countryCode: true,
      level: true,
      order: true,
      parentId: true,
    },
    orderBy: [{ countryCode: 'asc' }, { level: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    take,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
  });

  return districts.map((d) => ({
    id: d.id,
    name: d.name as DistrictData['name'],
    displayName: (d.displayName as DistrictData['displayName']) || undefined,
    countryCode: d.countryCode,
    level: d.level,
    order: d.order ?? undefined,
    parentId: d.parentId ?? undefined,
  }));
}

/**
 * 지역명 업데이트 (구현 예정)
 */
async function updateDistrictName(
  districtId: string,
  locale: Locale,
  newName: string,
  newDisplayName?: string,
  dryRun = false,
): Promise<UpdateResult> {
  try {
    // TODO: 실제 업데이트 로직 구현
    // 1. 현재 지역 데이터 조회
    // 2. LocalizedText 병합
    // 3. 데이터베이스 업데이트 (dryRun이 false인 경우)

    if (dryRun) {
      console.log(`[DRY RUN] 지역 ${districtId}의 ${locale} 이름을 "${newName}"으로 업데이트 예정`);
      return { success: true, id: districtId };
    }

    // 실제 업데이트 로직은 여기에 구현
    // const currentDistrict = await prisma.district.findUnique({ where: { id: districtId } });
    // const updatedName = mergeLocalizedText(currentDistrict.name, locale, newName);
    // await prisma.district.update({ where: { id: districtId }, data: { name: updatedName } });

    return { success: true, id: districtId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ 업데이트 실패 (${districtId}):`, errorMessage);
    return {
      success: false,
      id: districtId,
      error: errorMessage,
    };
  }
}

/**
 * 메인 업데이트 함수
 */
async function updateDistrictNames(): Promise<void> {
  try {
    console.log('🔄 지역명 다국어 업데이트 작업 시작...');

    const options = parseCliOptions();
    validateAndLogOptions(options);

    if (!options.locale) {
      throw new Error('언어 코드(--locale)를 지정해야 합니다.');
    }

    const locale = options.locale;
    const progressFilePath = `${PROGRESS_FILE_BASE}-${locale}.json`;

    // TODO: 번역 데이터 로드 (JSON 파일, Excel 파일 등에서)
    // const translationData = loadTranslationData(options.inputPath);

    // 기존 진행 상황 로드
    let progress = loadUpdateProgress(progressFilePath);

    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 실패: ${progress.failureCount})`,
      );
    } else {
      // TODO: 전체 지역 수 조회
      const totalCount = await prisma.district.count();
      progress = {
        processedCount: 0,
        totalCount: options.testMode ? Math.min(TEST_MAX_ITEMS, totalCount) : totalCount,
        successCount: 0,
        failureCount: 0,
        lastProcessedId: null,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      };
    }

    if (options.testMode) {
      console.log(`🧪 테스트 모드: ${TEST_MAX_ITEMS}개 항목만 처리합니다.`);
    }

    // 배치 처리
    const batchSize = options.batchSize || 20;
    let cursorId: string | null = progress.lastProcessedId;
    let fetchedTotal = progress.processedCount;

    while (true) {
      const remaining = options.limit ? options.limit - fetchedTotal : null;
      if (remaining !== null && remaining <= 0) break;

      const districts = await fetchDistricts({
        limit: remaining || null,
        batchSize,
        cursorId,
      });

      if (districts.length === 0) break;

      console.log(`\n📝 처리 중: ${fetchedTotal + 1}-${fetchedTotal + districts.length}/${progress.totalCount}`);

      // 배치별 업데이트 처리
      const updatePromises = districts.map(async (district) => {
        // TODO: 번역 데이터에서 해당 지역의 번역된 이름 찾기
        // const translatedName = findTranslation(translationData, district.id, locale);

        // 임시로 한국어 이름 사용 (실제로는 번역 데이터에서 가져와야 함)
        const translatedName = getKoreanText(district.name);
        const translatedDisplayName = district.displayName
          ? getKoreanText(district.displayName)
          : undefined;

        return updateDistrictName(
          district.id,
          locale,
          translatedName,
          translatedDisplayName,
          options.dryRun,
        );
      });

      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchSuccessCount = results.filter((r) => r.success).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      fetchedTotal += districts.length;
      progress.processedCount = fetchedTotal;
      progress.successCount += batchSuccessCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedId = districts[districts.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 진행 상황 저장
      saveUpdateProgress(progress, progressFilePath);

      console.log(`✅ 배치 완료: 성공 ${batchSuccessCount}개, 실패 ${batchFailureCount}개`);
      console.log(
        `📊 전체 진행률: ${progress.processedCount}/${progress.totalCount} (${Math.round((progress.processedCount / progress.totalCount) * 100)}%)`,
      );

      // 실패한 항목 로그
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        console.log('❌ 실패한 항목들:');
        failures.forEach((failure) => {
          console.log(`  - ${failure.id}: ${failure.error}`);
        });
      }

      cursorId = districts[districts.length - 1].id;

      // 데이터베이스 부하 방지를 위한 짧은 대기
      if (districts.length === batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 모든 지역명 업데이트 완료!');
    console.log(`📊 최종 결과:`);
    console.log(`  - 총 처리: ${progress.processedCount}개`);
    console.log(`  - 성공: ${progress.successCount}개`);
    console.log(`  - 실패: ${progress.failureCount}개`);
    console.log(
      `  - 성공률: ${Math.round((progress.successCount / progress.processedCount) * 100)}%`,
    );

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(progressFilePath)) {
      fs.unlinkSync(progressFilePath);
    }
  } catch (error) {
    console.error('❌ 업데이트 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateDistrictNames()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateDistrictNames };
