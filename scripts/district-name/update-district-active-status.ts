/**
 * District 활성화 상태 업데이트 스크립트
 *
 * 매핑 정보에 해당하는 District는 활성화(isActive=true)하고,
 * 해당하지 않는 District는 비활성화(isActive=false) 처리합니다.
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../../lib/prisma';
import type { UpdateProgress, UpdateResult } from './types';
import { parseCliOptions, validateAndLogOptions } from './cli-options';
import {
  ensureDirForFile,
  formatTimestampForFileName,
  saveUpdateProgress,
  loadUpdateProgress,
  getKoreanText,
} from './utils';
import { isMappedDistrict } from './district-mapping';

// 테스트 모드 설정
const TEST_MODE = false;
const TEST_MAX_ITEMS = 10; // 테스트 모드일 때 처리할 최대 항목 수

// 진행 상황 파일 경로
const PROGRESS_FILE_BASE = path.join(__dirname, 'output', 'update-district-active-progress');

/**
 * District 데이터 조회
 */
async function fetchDistricts(options: {
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

  const remaining = limit ? limit : null;

  const districts = await prisma.district.findMany({
    where: {
      countryCode: 'KR',
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
 * District의 활성화 상태 업데이트
 */
async function updateDistrictActiveStatus(
  districtId: string,
  koreanName: string,
  shouldBeActive: boolean,
  currentIsActive: boolean | null,
  dryRun = false,
): Promise<UpdateResult> {
  try {
    // 현재 상태와 목표 상태가 같으면 업데이트 불필요
    const currentActive = currentIsActive ?? true; // null이면 기본값 true로 간주
    if (currentActive === shouldBeActive) {
      return { success: true, id: districtId };
    }

    if (dryRun) {
      console.log(
        `  [DRY RUN] 업데이트 예정: isActive ${currentActive} → ${shouldBeActive} (${koreanName})`,
      );
      return { success: true, id: districtId };
    }

    // 실제 업데이트 수행
    await prisma.district.update({
      where: { id: districtId },
      data: {
        isActive: shouldBeActive,
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
async function updateDistrictActiveStatuses(): Promise<void> {
  try {
    console.log('🔄 District 활성화 상태 업데이트 작업 시작...\n');

    const options = parseCliOptions();
    validateAndLogOptions(options);

    const progressFilePath = `${PROGRESS_FILE_BASE}-${formatTimestampForFileName()}.json`;

    // 기존 진행 상황 로드
    let progress = loadUpdateProgress(progressFilePath);

    // 전체 District 수 조회
    const totalCount = await prisma.district.count({
      where: {
        countryCode: 'KR',
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

    console.log(`\n📊 전체 District 수: ${totalCount}개`);
    console.log(`📦 배치 크기: ${options.batchSize || 100}개\n`);

    // 배치 처리
    const batchSize = options.batchSize || 100;
    let cursorId: string | null = progress.lastProcessedId;
    let fetchedTotal = progress.processedCount;
    let activatedCount = 0;
    let deactivatedCount = 0;
    let unchangedCount = 0;

    while (true) {
      const remaining = options.limit ? options.limit - fetchedTotal : null;
      if (remaining !== null && remaining <= 0) break;

      const districts = await fetchDistricts({
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
        const isMapped = isMappedDistrict(koreanName);
        const shouldBeActive = isMapped;
        const currentIsActive = district.isActive ?? true; // null이면 기본값 true로 간주

        console.log(`\n📍 District ID: ${district.id}`);
        console.log(`   한국어 이름: ${koreanName}`);
        console.log(`   현재 isActive: ${currentIsActive}`);
        console.log(`   매핑 정보 여부: ${isMapped ? '✅ 있음' : '❌ 없음'}`);
        console.log(`   목표 isActive: ${shouldBeActive}`);

        // 현재 상태와 목표 상태가 같으면 변경 불필요
        if (currentIsActive === shouldBeActive) {
          unchangedCount++;
          console.log(`   ✅ 상태 변경 불필요 (이미 ${shouldBeActive ? '활성화' : '비활성화'} 상태)`);
          return { success: true, id: district.id, changed: false };
        }

        // 업데이트 수행
        const result = await updateDistrictActiveStatus(
          district.id,
          koreanName,
          shouldBeActive,
          district.isActive,
          options.dryRun,
        );

        if (result.success) {
          if (shouldBeActive) {
            activatedCount++;
            console.log(`   ✅ 활성화 완료`);
          } else {
            deactivatedCount++;
            console.log(`   ✅ 비활성화 완료`);
          }
          return { ...result, changed: true };
        }

        return result;
      });

      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchSuccessCount = results.filter((r) => r.success).length;
      const batchChangedCount = results.filter((r) => r.success && 'changed' in r && r.changed).length;
      const batchUnchangedCount = results.filter(
        (r) => r.success && 'changed' in r && !r.changed,
      ).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      fetchedTotal += districts.length;
      progress.processedCount = fetchedTotal;
      progress.successCount += batchSuccessCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedId = districts[districts.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 진행 상황 저장
      saveUpdateProgress(progress, progressFilePath);

      console.log(`\n📊 배치 완료 통계:`);
      console.log(`   - 성공 (변경 없음): ${batchUnchangedCount}개`);
      console.log(`   - 활성화/비활성화 완료: ${batchChangedCount}개`);
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
    console.log(`🎉 모든 District 활성화 상태 업데이트 완료!`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📊 최종 결과:`);
    console.log(`   - 총 처리: ${progress.processedCount}개`);
    console.log(`   - 활성화 완료: ${activatedCount}개`);
    console.log(`   - 비활성화 완료: ${deactivatedCount}개`);
    console.log(`   - 변경 없음: ${unchangedCount}개`);
    console.log(`   - 성공: ${progress.successCount}개`);
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
  updateDistrictActiveStatuses()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateDistrictActiveStatuses };
