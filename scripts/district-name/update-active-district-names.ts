/**
 * 활성화 District 지역명 업데이트 스크립트
 *
 * 활성화된 District 데이터의 name 필드를 매핑 정보와 비교하여
 * 각 언어별로 다른 부분을 자동으로 업데이트합니다.
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../../lib/prisma';
import type { Locale, LanguageComparison, UpdateResult } from './types';
import { parseCliOptions, validateAndLogOptions } from './cli-options';
import {
  ensureDirForFile,
  formatTimestampForFileName,
  saveUpdateProgress,
  loadUpdateProgress,
  getLocalizedText,
  getKoreanText,
} from './utils';
import { getDistrictMapping, isMappedDistrict } from './district-mapping';

// 테스트 모드 설정
const TEST_MODE = false;
const TEST_MAX_ITEMS = 10; // 테스트 모드일 때 처리할 최대 항목 수

// 진행 상황 파일 경로
const PROGRESS_FILE_BASE = path.join(__dirname, 'output', 'update-district-names-progress');

// 지원하는 모든 언어 목록
const ALL_LOCALES: Locale[] = ['ko_KR', 'en_US', 'th_TH', 'ja_JP', 'zh_TW', 'hi_IN'];

/**
 * 활성화된 District 데이터 조회
 */
async function fetchActiveDistricts(options: {
  limit?: number | null;
  batchSize: number;
  cursorId?: string | null;
}): Promise<
  Array<{
    id: string;
    name: unknown;
    isActive: boolean | null;
  }>
> {
  const { limit, batchSize, cursorId } = options;

  const districts = await prisma.district.findMany({
    where: {
      countryCode: 'KR',
      OR: [
        { isActive: true },
        { isActive: null }, // 기본값 true로 간주
      ],
    },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
    orderBy: { id: 'asc' },
    take: batchSize,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
  });

  return districts.map((d) => ({
    id: d.id,
    name: d.name,
    isActive: d.isActive,
  }));
}

/**
 * 언어별 비교 수행
 */
function compareLanguages(
  currentName: unknown,
  expectedMapping: Record<Locale, string>,
): LanguageComparison[] {
  const comparisons: LanguageComparison[] = [];

  for (const locale of ALL_LOCALES) {
    const current = getLocalizedText(currentName, locale);
    const expected = expectedMapping[locale] || '';

    comparisons.push({
      locale,
      current,
      expected,
      needsUpdate: current !== expected && expected !== '',
    });
  }

  return comparisons;
}

/**
 * District의 지역명 업데이트
 */
async function updateDistrictName(
  districtId: string,
  currentName: unknown,
  expectedMapping: Record<Locale, string>,
  dryRun = false,
): Promise<UpdateResult> {
  try {
    // 언어별 비교
    const comparisons = compareLanguages(currentName, expectedMapping);
    const needsUpdate = comparisons.filter((c) => c.needsUpdate);

    if (needsUpdate.length === 0) {
      return { success: true, id: districtId };
    }

    // 업데이트할 데이터 구성
    const updatedName: Record<Locale, string> = {} as Record<Locale, string>;

    // 기존 데이터 유지하면서 업데이트 필요한 언어만 변경
    for (const locale of ALL_LOCALES) {
      const comparison = comparisons.find((c) => c.locale === locale);
      if (comparison) {
        updatedName[locale] = comparison.needsUpdate
          ? comparison.expected
          : comparison.current || comparison.expected;
      }
    }

    if (dryRun) {
      console.log(`  [DRY RUN] 업데이트 예정:`);
      needsUpdate.forEach((comp) => {
        console.log(`    ${comp.locale}: "${comp.current || '(없음)'}" → "${comp.expected}"`);
      });
      console.log(`  [DRY RUN] 업데이트할 전체 데이터:`, JSON.stringify(updatedName, null, 2));
      return { success: true, id: districtId };
    }

    // 실제 업데이트 수행
    await prisma.district.update({
      where: { id: districtId },
      data: {
        name: updatedName,
      },
    });

    return { success: true, id: districtId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  ❌ 업데이트 실패:`, errorMessage);
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
async function updateActiveDistrictNames(): Promise<void> {
  try {
    console.log('🔄 활성화 District 지역명 업데이트 작업 시작...\n');

    const options = parseCliOptions();
    validateAndLogOptions(options);

    const progressFilePath = `${PROGRESS_FILE_BASE}-${formatTimestampForFileName()}.json`;

    // 기존 진행 상황 로드
    let progress = loadUpdateProgress(progressFilePath);

    // 활성화된 District 수 조회
    const totalCount = await prisma.district.count({
      where: {
        countryCode: 'KR',
        OR: [
          { isActive: true },
          { isActive: null },
        ],
      },
    });

    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 실패: ${progress.failureCount})`,
      );
    } else {
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

    console.log(`\n📊 활성화된 District 수: ${totalCount}개`);
    console.log(`📦 배치 크기: ${options.batchSize || 50}개\n`);

    // 배치 처리
    const batchSize = options.batchSize || 50;
    let cursorId: string | null = progress.lastProcessedId;
    let fetchedTotal = progress.processedCount;
    let updatedCount = 0;
    let skippedCount = 0;

    while (true) {
      const remaining = options.limit ? options.limit - fetchedTotal : null;
      if (remaining !== null && remaining <= 0) break;

      const districts = await fetchActiveDistricts({
        limit: remaining || null,
        batchSize,
        cursorId,
      });

      if (districts.length === 0) break;

      console.log(
        `\n${'='.repeat(80)}\n📝 배치 처리: ${fetchedTotal + 1}-${fetchedTotal + districts.length}/${progress.totalCount}\n${'='.repeat(80)}`,
      );

      // 배치별 업데이트 처리
      const updatePromises = districts.map(async (district) => {
        const koreanName = getKoreanText(district.name);

        console.log(`\n📍 District ID: ${district.id}`);
        console.log(`   한국어 이름: ${koreanName}`);

        // 매핑 정보 확인
        if (!isMappedDistrict(koreanName)) {
          console.log(`   ⚠️  매핑 정보에 없는 지역명 "${koreanName}"입니다. 스킵합니다.`);
          skippedCount++;
          return { success: true, id: district.id, skipped: true };
        }

        const mapping = getDistrictMapping(koreanName);
        if (!mapping) {
          console.log(`   ⚠️  매핑 정보를 찾을 수 없습니다. 스킵합니다.`);
          skippedCount++;
          return { success: true, id: district.id, skipped: true };
        }

        // 언어별 비교
        const comparisons = compareLanguages(district.name, mapping);
        const needsUpdate = comparisons.filter((c) => c.needsUpdate);

        if (needsUpdate.length === 0) {
          console.log(`   ✅ 모든 언어가 매핑 정보와 일치합니다. 업데이트 불필요.`);
          return { success: true, id: district.id, updated: false };
        }

        // 업데이트 필요한 언어 출력
        console.log(`   📋 언어별 비교 결과:`);
        comparisons.forEach((comp) => {
          if (comp.needsUpdate) {
            console.log(
              `      ${comp.locale}: "${comp.current || '(없음)'}" → "${comp.expected}" 🔄`,
            );
          } else {
            console.log(`      ${comp.locale}: "${comp.current || '(없음)'}" ✅`);
          }
        });

        console.log(`   🔄 업데이트 필요한 언어: ${needsUpdate.length}개`);

        // 업데이트 수행
        const result = await updateDistrictName(
          district.id,
          district.name,
          mapping,
          options.dryRun,
        );

        if (result.success) {
          updatedCount++;
          if (options.dryRun) {
            console.log(`   ✅ [DRY RUN] 업데이트 시뮬레이션 완료 (실제 DB 업데이트는 수행하지 않음)`);
          } else {
            console.log(`   ✅ 업데이트 완료`);
          }
          return { ...result, updated: true };
        }

        return result;
      });

      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchSuccessCount = results.filter(
        (r) => r.success && !('skipped' in r && r.skipped) && !('updated' in r && r.updated),
      ).length;
      const batchUpdatedCount = results.filter((r) => r.success && 'updated' in r && r.updated).length;
      const batchSkippedCount = results.filter((r) => 'skipped' in r && r.skipped).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      fetchedTotal += districts.length;
      progress.processedCount = fetchedTotal;
      progress.successCount += batchSuccessCount + batchUpdatedCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedId = districts[districts.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 진행 상황 저장
      saveUpdateProgress(progress, progressFilePath);

      console.log(`\n📊 배치 완료 통계:`);
      console.log(`   - 성공 (업데이트 불필요): ${batchSuccessCount}개`);
      console.log(`   - 업데이트 완료: ${batchUpdatedCount}개`);
      console.log(`   - 스킵: ${batchSkippedCount}개`);
      console.log(`   - 실패: ${batchFailureCount}개`);
      console.log(
        `   - 전체 진행률: ${progress.processedCount}/${progress.totalCount} (${Math.round((progress.processedCount / progress.totalCount) * 100)}%)`,
      );

      // 실패한 항목 로그
      const failures = results.filter((r) => !r.success) as UpdateResult[];
      if (failures.length > 0) {
        console.log(`\n❌ 실패한 항목들:`);
        failures.forEach((failure) => {
          console.log(`   - ${failure.id}: ${failure.error || 'Unknown error'}`);
        });
      }

      cursorId = districts[districts.length - 1].id;

      // 데이터베이스 부하 방지를 위한 짧은 대기
      if (districts.length === batchSize) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 모든 활성화 District 지역명 업데이트 완료!`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📊 최종 결과:`);
    console.log(`   - 총 처리: ${progress.processedCount}개`);
    console.log(`   - 업데이트 완료: ${updatedCount}개`);
    console.log(`   - 스킵: ${skippedCount}개`);
    console.log(`   - 성공 (업데이트 불필요): ${progress.successCount - updatedCount}개`);
    console.log(`   - 실패: ${progress.failureCount}개`);
    if (progress.processedCount > 0) {
      console.log(
        `   - 성공률: ${Math.round(((progress.successCount - progress.failureCount) / progress.processedCount) * 100)}%`,
      );
    }

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(progressFilePath)) {
      fs.unlinkSync(progressFilePath);
      console.log(`\n🗑️  진행 상황 파일 삭제 완료: ${progressFilePath}`);
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
  updateActiveDistrictNames()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateActiveDistrictNames };
