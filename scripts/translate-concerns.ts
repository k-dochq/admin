import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBiNzG9ERTywmtzap6sQ0KjrD4FU5uQxzg';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, '../output/translated-concerns.json');
const PROGRESS_FILE = path.join(__dirname, '../output/concerns-translation-progress.json');

// 번역 결과 타입
interface TranslatedConcern {
  id: string;
  concerns: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
}

// 진행 상황 타입
interface TranslationProgress {
  processedCount: number;
  totalCount: number;
  lastProcessedId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

// Google Translate API 응답 타입
interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * Google Translate API를 사용하여 텍스트를 번역하는 함수
 */
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TranslateResponse = await response.json();

    if (result.data.translations && result.data.translations.length > 0) {
      return result.data.translations[0].translatedText;
    } else {
      throw new Error('No translation found in response');
    }
  } catch (error) {
    console.error(`Translation error (${sourceLang} → ${targetLang}):`, error);
    throw error;
  }
}

/**
 * 배치로 여러 텍스트를 번역하는 함수 (API 요청 횟수 절약)
 */
async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string,
): Promise<string[]> {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: TranslateResponse = await response.json();

    if (result.data.translations && result.data.translations.length > 0) {
      return result.data.translations.map((t) => t.translatedText);
    } else {
      throw new Error('No translations found in response');
    }
  } catch (error) {
    console.error(`Batch translation error (${sourceLang} → ${targetLang}):`, error);
    throw error;
  }
}

/**
 * 진행 상황을 저장하는 함수
 */
function saveProgress(progress: TranslationProgress): void {
  const outputDir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * 진행 상황을 로드하는 함수
 */
function loadProgress(): TranslationProgress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return null;
}

/**
 * 번역 결과를 파일에 저장하는 함수
 */
function saveResults(results: TranslatedConcern[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedConcern[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const data = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading existing results:', error);
  }
  return [];
}

/**
 * 메인 번역 함수
 */
async function translateConcerns() {
  try {
    console.log('🌐 리뷰 concerns 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();

    // concerns가 있는 리뷰만 조회
    const totalCount = await prisma.review.count({
      where: {
        concerns: {
          not: null,
        },
      },
    });

    console.log(`📊 concerns가 있는 총 ${totalCount}개의 리뷰를 처리합니다.`);

    if (progress) {
      console.log(`🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료`);
    } else {
      progress = {
        processedCount: 0,
        totalCount,
        lastProcessedId: null,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      };
    }

    // 배치 크기 설정 (API 요청 횟수 절약을 위해)
    const BATCH_SIZE = 10;
    const TRANSLATION_BATCH_SIZE = 5; // Google Translate API 배치 크기

    let skip = progress.processedCount;

    while (skip < totalCount) {
      console.log(
        `\n📝 처리 중: ${skip + 1}-${Math.min(skip + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      // concerns가 있는 리뷰 배치 조회
      const reviews = await prisma.review.findMany({
        select: {
          id: true,
          concerns: true,
        },
        where: {
          concerns: {
            not: null,
          },
        },
        skip,
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' },
      });

      if (reviews.length === 0) break;

      // 번역할 텍스트 수집 (null이 아닌 concerns만)
      const textsToTranslate: { id: string; text: string }[] = [];

      for (const review of reviews) {
        if (review.concerns && review.concerns.trim()) {
          textsToTranslate.push({ id: review.id, text: review.concerns.trim() });
        }
      }

      if (textsToTranslate.length === 0) {
        skip += BATCH_SIZE;
        continue;
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          concerns_en?: string;
          concerns_th?: string;
        };
      } = {};

      for (let i = 0; i < textsToTranslate.length; i += TRANSLATION_BATCH_SIZE) {
        const batch = textsToTranslate.slice(i, i + TRANSLATION_BATCH_SIZE);
        const texts = batch.map((item) => item.text);

        try {
          // 영어 번역
          console.log(
            `  🔄 영어 번역 중... (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, textsToTranslate.length)}/${textsToTranslate.length})`,
          );
          const englishTranslations = await translateBatch(texts, 'ko', 'en');

          // 태국어 번역
          console.log(
            `  🔄 태국어 번역 중... (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, textsToTranslate.length)}/${textsToTranslate.length})`,
          );
          const thaiTranslations = await translateBatch(texts, 'ko', 'th');

          // 결과 저장
          batch.forEach((item, index) => {
            translationResults[item.id] = {
              concerns_en: englishTranslations[index],
              concerns_th: thaiTranslations[index],
            };
          });

          // API 요청 간격 (Rate Limit 방지)
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`배치 번역 실패:`, error);
          // 실패한 경우 개별 번역 시도
          for (const item of batch) {
            try {
              const englishTranslation = await translateText(item.text, 'ko', 'en');
              const thaiTranslation = await translateText(item.text, 'ko', 'th');

              translationResults[item.id] = {
                concerns_en: englishTranslation,
                concerns_th: thaiTranslation,
              };

              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (individualError) {
              console.error(`개별 번역 실패 (${item.id}):`, individualError);
            }
          }
        }
      }

      // 결과 구성
      for (const review of reviews) {
        if (!review.concerns || !review.concerns.trim()) continue;

        const concernsKo = review.concerns.trim();
        const translations = translationResults[review.id] || {};

        const translatedConcern: TranslatedConcern = {
          id: review.id,
          concerns: {
            ko_KR: concernsKo,
            en_US: translations.concerns_en || concernsKo,
            th_TH: translations.concerns_th || concernsKo,
          },
        };

        existingResults.push(translatedConcern);
      }

      // 진행 상황 업데이트
      progress.processedCount = skip + reviews.length;
      progress.lastProcessedId = reviews[reviews.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      skip += BATCH_SIZE;
    }

    console.log('\n🎉 모든 concerns 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 concerns: ${existingResults.length}개`);

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch (error) {
    console.error('❌ 번역 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  translateConcerns()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateConcerns };
