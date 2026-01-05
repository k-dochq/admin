import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 테스트 모드 설정 (true로 설정하면 첫 번째 항목만 업데이트)
const TEST_MODE = false;
const TEST_MAX_ITEMS = 1; // 테스트 모드일 때 처리할 최대 항목 수

// 번역 결과 파일 경로
const TRANSLATION_FILE = path.join(__dirname, 'output/translated-notices-ja-jp.json');
const UPDATE_PROGRESS_FILE = path.join(__dirname, 'output/update-progress-ja-jp.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
};

// 번역 결과 타입
interface TranslatedNotice {
  id: string;
  title: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
  };
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
  };
}

// 업데이트 진행 상황 타입
interface UpdateProgress {
  processedCount: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastProcessedId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

/**
 * 기존 LocalizedText에 ja_JP만 추가/업데이트하는 함수
 */
function mergeLocalizedTextWithJaJP(existing: Prisma.JsonValue, jaJPText: string): LocalizedText {
  let currentText: LocalizedText = {};

  // 기존 데이터 파싱
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    currentText = existing as LocalizedText;
  } else if (typeof existing === 'string') {
    // 문자열인 경우 ko_KR로 처리
    currentText = { ko_KR: existing };
  }

  // 기존 데이터 유지하고 ja_JP만 추가/업데이트
  return {
    ko_KR: currentText.ko_KR || '',
    en_US: currentText.en_US || '',
    th_TH: currentText.th_TH || '',
    zh_TW: currentText.zh_TW || '',
    ja_JP: jaJPText,
  };
}

/**
 * 진행 상황을 저장하는 함수
 */
function saveUpdateProgress(progress: UpdateProgress): void {
  const outputDir = path.dirname(UPDATE_PROGRESS_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(UPDATE_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * 진행 상황을 로드하는 함수
 */
function loadUpdateProgress(): UpdateProgress | null {
  try {
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      const data = fs.readFileSync(UPDATE_PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading update progress:', error);
  }
  return null;
}

/**
 * 번역 결과 파일을 로드하는 함수
 */
function loadTranslationResults(): TranslatedNotice[] {
  try {
    if (!fs.existsSync(TRANSLATION_FILE)) {
      throw new Error(`번역 결과 파일을 찾을 수 없습니다: ${TRANSLATION_FILE}`);
    }

    const data = fs.readFileSync(TRANSLATION_FILE, 'utf-8');
    const results = JSON.parse(data);

    if (!Array.isArray(results)) {
      throw new Error('번역 결과 파일 형식이 올바르지 않습니다.');
    }

    return results;
  } catch (error) {
    console.error('Error loading translation results:', error);
    throw error;
  }
}

/**
 * 메인 업데이트 함수
 */
async function updateNoticesJaJP() {
  try {
    console.log('🔄 공지사항(Notice) 일본어(ja-JP) 업데이트 작업 시작...');

    // 번역 결과 파일 로드
    const allTranslationResults = loadTranslationResults();
    console.log(`📁 번역 결과 로드 완료: ${allTranslationResults.length}개`);

    // 테스트 모드일 경우 첫 번째 항목만 처리
    const translationResults = TEST_MODE
      ? allTranslationResults.slice(0, TEST_MAX_ITEMS)
      : allTranslationResults;

    if (TEST_MODE) {
      console.log(`🧪 테스트 모드: ${TEST_MAX_ITEMS}개 항목만 처리합니다.`);
    }

    // 기존 진행 상황 로드
    let progress = loadUpdateProgress();

    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 실패: ${progress.failureCount})`,
      );
    } else {
      progress = {
        processedCount: 0,
        totalCount: translationResults.length,
        successCount: 0,
        failureCount: 0,
        lastProcessedId: null,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      };
    }

    // 배치 크기 설정
    const BATCH_SIZE = 20;
    let startIndex = progress.processedCount;

    while (startIndex < translationResults.length) {
      const endIndex = Math.min(startIndex + BATCH_SIZE, translationResults.length);
      const batch = translationResults.slice(startIndex, endIndex);

      console.log(`\n📝 처리 중: ${startIndex + 1}-${endIndex}/${translationResults.length}`);

      // 배치별 업데이트 처리
      const updatePromises = batch.map(async (translatedNotice) => {
        try {
          // 현재 공지사항 데이터 조회
          const currentNotice = await prisma.notice.findUnique({
            where: { id: translatedNotice.id },
            select: {
              id: true,
              title: true,
              content: true,
            },
          });

          if (!currentNotice) {
            console.warn(`⚠️  공지사항을 찾을 수 없습니다: ${translatedNotice.id}`);
            return { success: false, id: translatedNotice.id, error: 'Notice not found' };
          }

          // 업데이트할 데이터 구성
          const updateData: {
            title?: LocalizedText;
            content?: LocalizedText;
          } = {};

          // title 업데이트 (기존 데이터 유지하고 ja_JP만 추가)
          if (translatedNotice.title.ja_JP) {
            updateData.title = mergeLocalizedTextWithJaJP(
              currentNotice.title,
              translatedNotice.title.ja_JP,
            );
          }

          // content 업데이트 (기존 데이터 유지하고 ja_JP만 추가)
          if (translatedNotice.content.ja_JP) {
            updateData.content = mergeLocalizedTextWithJaJP(
              currentNotice.content,
              translatedNotice.content.ja_JP,
            );
          }

          // 데이터베이스 업데이트
          if (Object.keys(updateData).length > 0) {
            await prisma.notice.update({
              where: { id: translatedNotice.id },
              data: updateData,
            });
          }

          return { success: true, id: translatedNotice.id };
        } catch (error) {
          console.error(`❌ 업데이트 실패 (${translatedNotice.id}):`, error);
          return {
            success: false,
            id: translatedNotice.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      // 배치 결과 처리
      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchSuccessCount = results.filter((r) => r.success).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      progress.processedCount = endIndex;
      progress.successCount += batchSuccessCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedId = batch[batch.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 진행 상황 저장
      saveUpdateProgress(progress);

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

      startIndex = endIndex;

      // 데이터베이스 부하 방지를 위한 짧은 대기
      if (startIndex < translationResults.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 모든 공지사항 일본어(ja-JP) 업데이트 완료!');
    console.log(`📊 최종 결과:`);
    console.log(`  - 총 처리: ${progress.processedCount}개`);
    console.log(`  - 성공: ${progress.successCount}개`);
    console.log(`  - 실패: ${progress.failureCount}개`);
    console.log(
      `  - 성공률: ${Math.round((progress.successCount / progress.processedCount) * 100)}%`,
    );

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      fs.unlinkSync(UPDATE_PROGRESS_FILE);
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
  updateNoticesJaJP()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateNoticesJaJP };
