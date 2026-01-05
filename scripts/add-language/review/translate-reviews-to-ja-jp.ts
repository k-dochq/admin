import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-reviews-ja-jp.json');
const PROGRESS_FILE = path.join(__dirname, 'output/translation-progress-ja-jp.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
};

// 번역 결과 타입
interface TranslatedReview {
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
  concernsMultilingual?: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
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
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
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
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
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
 * LocalizedText에서 소스 텍스트 추출 (한국어 우선, 없으면 영어, 태국어 순)
 */
function getSourceText(localizedText: Prisma.JsonValue): string {
  if (!localizedText) return '';
  if (typeof localizedText === 'string') return localizedText;

  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    // 한국어 우선, 없으면 영어, 태국어 순으로 사용
    return text.ko_KR || text.en_US || text.th_TH || '';
  }

  return '';
}

/**
 * LocalizedText에서 특정 언어의 텍스트 추출
 */
function getTextByLocale(localizedText: Prisma.JsonValue, locale: keyof LocalizedText): string {
  if (!localizedText) return '';
  if (typeof localizedText === 'string') {
    // 문자열인 경우 ko_KR로 간주
    return locale === 'ko_KR' ? localizedText : '';
  }

  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    return text[locale] || '';
  }

  return '';
}

/**
 * ja_JP 번역이 필요한지 확인
 */
function needsJaJPTranslation(localizedText: Prisma.JsonValue): boolean {
  if (!localizedText) return false;
  if (typeof localizedText === 'string') {
    // 문자열인 경우 번역 필요 (ko_KR로 간주)
    return true;
  }

  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    const sourceText = text.ko_KR || text.en_US || text.th_TH;
    const jaJPText = text.ja_JP;

    // 소스 텍스트가 있고, ja_JP가 없거나 비어있으면 번역 필요
    return !!sourceText && (!jaJPText || jaJPText.trim() === '');
  }

  return false;
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
function saveResults(results: TranslatedReview[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedReview[] {
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
async function translateReviewsToJaJP() {
  try {
    console.log('🌐 리뷰 일본어(ja-JP) 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((r) => r.id));

    // 모든 리뷰 조회
    const allReviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        concernsMultilingual: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 리뷰만 필터링 (ja_JP가 없거나 비어있는 경우)
    const reviewsToTranslate = allReviews.filter((review) => {
      // 이미 처리된 리뷰는 제외
      if (existingIds.has(review.id)) {
        return false;
      }

      // title, content, concernsMultilingual 중 하나라도 번역이 필요하면 포함
      return (
        needsJaJPTranslation(review.title) ||
        needsJaJPTranslation(review.content) ||
        (review.concernsMultilingual && needsJaJPTranslation(review.concernsMultilingual))
      );
    });

    const totalCount = reviewsToTranslate.length;
    console.log(
      `📊 총 ${allReviews.length}개 리뷰 중 ${totalCount}개 리뷰가 일본어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 리뷰가 없습니다.');
      return;
    }

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

    let processedCount = progress.processedCount;

    while (processedCount < totalCount) {
      console.log(
        `\n📝 처리 중: ${processedCount + 1}-${Math.min(processedCount + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      // 번역이 필요한 리뷰 배치 가져오기
      const reviews = reviewsToTranslate.slice(processedCount, processedCount + BATCH_SIZE);

      if (reviews.length === 0) break;

      // 번역할 텍스트 수집
      const textsToTranslate: {
        id: string;
        type: 'title' | 'content' | 'concerns';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const review of reviews) {
        // 제목 번역
        if (needsJaJPTranslation(review.title)) {
          const sourceText = getSourceText(review.title);
          if (sourceText) {
            const currentTitle = review.title as LocalizedText;
            // 소스 언어 결정 (한국어 우선)
            const sourceLang = currentTitle.ko_KR ? 'ko' : currentTitle.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: review.id,
              type: 'title',
              text: sourceText,
              sourceLang,
            });
          }
        }

        // 내용 번역
        if (needsJaJPTranslation(review.content)) {
          const sourceText = getSourceText(review.content);
          if (sourceText) {
            const currentContent = review.content as LocalizedText;
            const sourceLang = currentContent.ko_KR ? 'ko' : currentContent.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: review.id,
              type: 'content',
              text: sourceText,
              sourceLang,
            });
          }
        }

        // concernsMultilingual 번역
        if (review.concernsMultilingual && needsJaJPTranslation(review.concernsMultilingual)) {
          const sourceText = getSourceText(review.concernsMultilingual);
          if (sourceText) {
            const currentConcerns = review.concernsMultilingual as LocalizedText;
            const sourceLang = currentConcerns.ko_KR ? 'ko' : currentConcerns.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: review.id,
              type: 'concerns',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          title_ja_JP?: string;
          content_ja_JP?: string;
          concerns_ja_JP?: string;
        };
      } = {};

      // 소스 언어별로 그룹화하여 번역
      const textsBySourceLang: {
        [key: string]: typeof textsToTranslate;
      } = {};

      for (const item of textsToTranslate) {
        if (!textsBySourceLang[item.sourceLang]) {
          textsBySourceLang[item.sourceLang] = [];
        }
        textsBySourceLang[item.sourceLang].push(item);
      }

      // 각 소스 언어별로 번역 수행
      for (const [sourceLang, items] of Object.entries(textsBySourceLang)) {
        for (let i = 0; i < items.length; i += TRANSLATION_BATCH_SIZE) {
          const batch = items.slice(i, i + TRANSLATION_BATCH_SIZE);
          const texts = batch.map((item) => item.text);

          try {
            console.log(
              `  🔄 일본어 번역 중... (${sourceLang} → ja) (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, items.length)}/${items.length})`,
            );
            const jaJPTranslations = await translateBatch(texts, sourceLang, 'ja');

            // 결과 저장
            batch.forEach((item, index) => {
              if (!translationResults[item.id]) {
                translationResults[item.id] = {};
              }

              if (item.type === 'title') {
                translationResults[item.id].title_ja_JP = jaJPTranslations[index];
              } else if (item.type === 'content') {
                translationResults[item.id].content_ja_JP = jaJPTranslations[index];
              } else if (item.type === 'concerns') {
                translationResults[item.id].concerns_ja_JP = jaJPTranslations[index];
              }
            });

            // API 요청 간격 (Rate Limit 방지)
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`배치 번역 실패:`, error);
            // 실패한 경우 개별 번역 시도
            for (const item of batch) {
              try {
                if (!translationResults[item.id]) {
                  translationResults[item.id] = {};
                }

                const jaJPTranslation = await translateText(item.text, item.sourceLang, 'ja');

                if (item.type === 'title') {
                  translationResults[item.id].title_ja_JP = jaJPTranslation;
                } else if (item.type === 'content') {
                  translationResults[item.id].content_ja_JP = jaJPTranslation;
                } else if (item.type === 'concerns') {
                  translationResults[item.id].concerns_ja_JP = jaJPTranslation;
                }

                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (individualError) {
                console.error(`개별 번역 실패 (${item.id}, ${item.type}):`, individualError);
              }
            }
          }
        }
      }

      // 결과 파일용 데이터 구성
      for (const review of reviews) {
        const titleKo = getTextByLocale(review.title, 'ko_KR');
        const titleEn = getTextByLocale(review.title, 'en_US');
        const titleTh = getTextByLocale(review.title, 'th_TH');
        const titleZhTW = getTextByLocale(review.title, 'zh_TW');
        const contentKo = getTextByLocale(review.content, 'ko_KR');
        const contentEn = getTextByLocale(review.content, 'en_US');
        const contentTh = getTextByLocale(review.content, 'th_TH');
        const contentZhTW = getTextByLocale(review.content, 'zh_TW');

        const translations = translationResults[review.id] || {};

        const translatedReview: TranslatedReview = {
          id: review.id,
          title: {
            ko_KR: titleKo,
            en_US: titleEn,
            th_TH: titleTh,
            zh_TW: titleZhTW,
            ja_JP: translations.title_ja_JP || getTextByLocale(review.title, 'ja_JP') || titleKo,
          },
          content: {
            ko_KR: contentKo,
            en_US: contentEn,
            th_TH: contentTh,
            zh_TW: contentZhTW,
            ja_JP:
              translations.content_ja_JP || getTextByLocale(review.content, 'ja_JP') || contentKo,
          },
        };

        // concernsMultilingual 처리
        if (review.concernsMultilingual) {
          const concernsKo = getTextByLocale(review.concernsMultilingual, 'ko_KR');
          const concernsEn = getTextByLocale(review.concernsMultilingual, 'en_US');
          const concernsTh = getTextByLocale(review.concernsMultilingual, 'th_TH');
          const concernsZhTW = getTextByLocale(review.concernsMultilingual, 'zh_TW');

          translatedReview.concernsMultilingual = {
            ko_KR: concernsKo,
            en_US: concernsEn,
            th_TH: concernsTh,
            zh_TW: concernsZhTW,
            ja_JP:
              translations.concerns_ja_JP ||
              getTextByLocale(review.concernsMultilingual, 'ja_JP') ||
              concernsKo,
          };
        }

        existingResults.push(translatedReview);
      }

      // 진행 상황 업데이트
      progress.processedCount = processedCount + reviews.length;
      progress.lastProcessedId = reviews[reviews.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 리뷰 일본어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 리뷰: ${existingResults.length}개`);

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
  translateReviewsToJaJP()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateReviewsToJaJP };
