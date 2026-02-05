import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-reviews-ru-ru.json');
const PROGRESS_FILE = path.join(__dirname, 'output/translation-progress-ru-ru.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
  hi_IN?: string;
  tl_PH?: string;
  ar_SA?: string;
  ru_RU?: string;
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
    hi_IN: string;
    tl_PH: string;
    ar_SA: string;
    ru_RU: string;
  };
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
    hi_IN: string;
    tl_PH: string;
    ar_SA: string;
    ru_RU: string;
  };
  concernsMultilingual?: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
    hi_IN: string;
    tl_PH: string;
    ar_SA: string;
    ru_RU: string;
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

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: sourceLang, target: targetLang }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const result: TranslateResponse = await response.json();
    if (result.data.translations?.length > 0) {
      return result.data.translations[0].translatedText;
    }
    throw new Error('No translation found in response');
  } catch (error) {
    console.error(`Translation error (${sourceLang} → ${targetLang}):`, error);
    throw error;
  }
}

async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string,
): Promise<string[]> {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: sourceLang, target: targetLang }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const result: TranslateResponse = await response.json();
    if (result.data.translations?.length > 0) {
      return result.data.translations.map((t) => t.translatedText);
    }
    throw new Error('No translations found in response');
  } catch (error) {
    console.error(`Batch translation error (${sourceLang} → ${targetLang}):`, error);
    throw error;
  }
}

function getSourceText(localizedText: Prisma.JsonValue): string {
  if (!localizedText) return '';
  if (typeof localizedText === 'string') return localizedText;
  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    return text.ko_KR || text.en_US || text.th_TH || '';
  }
  return '';
}

function getTextByLocale(localizedText: Prisma.JsonValue, locale: keyof LocalizedText): string {
  if (!localizedText) return '';
  if (typeof localizedText === 'string') return locale === 'ko_KR' ? localizedText : '';
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

function needsRuRUTranslation(localizedText: Prisma.JsonValue): boolean {
  if (!localizedText) return false;
  if (typeof localizedText === 'string') return true;
  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    const sourceText = text.ko_KR || text.en_US || text.th_TH;
    const ruRUText = text.ru_RU;
    return !!sourceText && (!ruRUText || ruRUText.trim() === '');
  }
  return false;
}

function saveProgress(progress: TranslationProgress): void {
  const outputDir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadProgress(): TranslationProgress | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return null;
}

function saveResults(results: TranslatedReview[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

function loadExistingResults(): TranslatedReview[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading existing results:', error);
  }
  return [];
}

async function translateReviewsToRuRU() {
  try {
    console.log('🌐 리뷰 러시아어(ru-RU) 번역 작업 시작...');

    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((r) => r.id));

    const allReviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        concernsMultilingual: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const reviewsToTranslate = allReviews.filter((review) => {
      if (existingIds.has(review.id)) return false;
      return (
        needsRuRUTranslation(review.title) ||
        needsRuRUTranslation(review.content) ||
        (review.concernsMultilingual && needsRuRUTranslation(review.concernsMultilingual))
      );
    });

    const totalCount = reviewsToTranslate.length;
    console.log(
      `📊 총 ${allReviews.length}개 리뷰 중 ${totalCount}개 리뷰가 러시아어 번역이 필요합니다.`,
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

    const BATCH_SIZE = 10;
    const TRANSLATION_BATCH_SIZE = 5;
    let processedCount = progress.processedCount;

    while (processedCount < totalCount) {
      console.log(
        `\n📝 처리 중: ${processedCount + 1}-${Math.min(processedCount + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      const reviews = reviewsToTranslate.slice(processedCount, processedCount + BATCH_SIZE);
      if (reviews.length === 0) break;

      const textsToTranslate: {
        id: string;
        type: 'title' | 'content' | 'concerns';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const review of reviews) {
        if (needsRuRUTranslation(review.title)) {
          const sourceText = getSourceText(review.title);
          if (sourceText) {
            const currentTitle = review.title as LocalizedText;
            const sourceLang = currentTitle.ko_KR ? 'ko' : currentTitle.en_US ? 'en' : 'th';
            textsToTranslate.push({ id: review.id, type: 'title', text: sourceText, sourceLang });
          }
        }
        if (needsRuRUTranslation(review.content)) {
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
        if (review.concernsMultilingual && needsRuRUTranslation(review.concernsMultilingual)) {
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

      const translationResults: {
        [key: string]: {
          title_ru_RU?: string;
          content_ru_RU?: string;
          concerns_ru_RU?: string;
        };
      } = {};
      const textsBySourceLang: { [key: string]: typeof textsToTranslate } = {};
      for (const item of textsToTranslate) {
        if (!textsBySourceLang[item.sourceLang]) textsBySourceLang[item.sourceLang] = [];
        textsBySourceLang[item.sourceLang].push(item);
      }

      for (const [sourceLang, items] of Object.entries(textsBySourceLang)) {
        for (let i = 0; i < items.length; i += TRANSLATION_BATCH_SIZE) {
          const batch = items.slice(i, i + TRANSLATION_BATCH_SIZE);
          const texts = batch.map((item) => item.text);
          try {
            console.log(
              `  🔄 러시아어 번역 중... (${sourceLang} → ru) (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, items.length)}/${items.length})`,
            );
            const ruRUTranslations = await translateBatch(texts, sourceLang, 'ru');
            batch.forEach((item, index) => {
              if (!translationResults[item.id]) translationResults[item.id] = {};
              if (item.type === 'title')
                translationResults[item.id].title_ru_RU = ruRUTranslations[index];
              else if (item.type === 'content')
                translationResults[item.id].content_ru_RU = ruRUTranslations[index];
              else if (item.type === 'concerns')
                translationResults[item.id].concerns_ru_RU = ruRUTranslations[index];
            });
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`배치 번역 실패:`, error);
            for (const item of batch) {
              try {
                if (!translationResults[item.id]) translationResults[item.id] = {};
                const ruRUTranslation = await translateText(item.text, item.sourceLang, 'ru');
                if (item.type === 'title')
                  translationResults[item.id].title_ru_RU = ruRUTranslation;
                else if (item.type === 'content')
                  translationResults[item.id].content_ru_RU = ruRUTranslation;
                else if (item.type === 'concerns')
                  translationResults[item.id].concerns_ru_RU = ruRUTranslation;
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (individualError) {
                console.error(`개별 번역 실패 (${item.id}, ${item.type}):`, individualError);
              }
            }
          }
        }
      }

      for (const review of reviews) {
        const titleKo = getTextByLocale(review.title, 'ko_KR');
        const titleEn = getTextByLocale(review.title, 'en_US');
        const titleTh = getTextByLocale(review.title, 'th_TH');
        const titleZhTW = getTextByLocale(review.title, 'zh_TW');
        const titleJaJP = getTextByLocale(review.title, 'ja_JP');
        const titleHiIN = getTextByLocale(review.title, 'hi_IN');
        const titleTlPH = getTextByLocale(review.title, 'tl_PH');
        const titleArSA = getTextByLocale(review.title, 'ar_SA');
        const contentKo = getTextByLocale(review.content, 'ko_KR');
        const contentEn = getTextByLocale(review.content, 'en_US');
        const contentTh = getTextByLocale(review.content, 'th_TH');
        const contentZhTW = getTextByLocale(review.content, 'zh_TW');
        const contentJaJP = getTextByLocale(review.content, 'ja_JP');
        const contentHiIN = getTextByLocale(review.content, 'hi_IN');
        const contentTlPH = getTextByLocale(review.content, 'tl_PH');
        const contentArSA = getTextByLocale(review.content, 'ar_SA');
        const tr = translationResults[review.id] || {};

        const translatedReview: TranslatedReview = {
          id: review.id,
          title: {
            ko_KR: titleKo,
            en_US: titleEn,
            th_TH: titleTh,
            zh_TW: titleZhTW,
            ja_JP: titleJaJP,
            hi_IN: titleHiIN,
            tl_PH: titleTlPH,
            ar_SA: titleArSA,
            ru_RU: tr.title_ru_RU || getTextByLocale(review.title, 'ru_RU') || titleKo,
          },
          content: {
            ko_KR: contentKo,
            en_US: contentEn,
            th_TH: contentTh,
            zh_TW: contentZhTW,
            ja_JP: contentJaJP,
            hi_IN: contentHiIN,
            tl_PH: contentTlPH,
            ar_SA: contentArSA,
            ru_RU: tr.content_ru_RU || getTextByLocale(review.content, 'ru_RU') || contentKo,
          },
        };

        if (review.concernsMultilingual) {
          const concernsKo = getTextByLocale(review.concernsMultilingual, 'ko_KR');
          const concernsEn = getTextByLocale(review.concernsMultilingual, 'en_US');
          const concernsTh = getTextByLocale(review.concernsMultilingual, 'th_TH');
          const concernsZhTW = getTextByLocale(review.concernsMultilingual, 'zh_TW');
          const concernsJaJP = getTextByLocale(review.concernsMultilingual, 'ja_JP');
          const concernsHiIN = getTextByLocale(review.concernsMultilingual, 'hi_IN');
          const concernsTlPH = getTextByLocale(review.concernsMultilingual, 'tl_PH');
          const concernsArSA = getTextByLocale(review.concernsMultilingual, 'ar_SA');

          translatedReview.concernsMultilingual = {
            ko_KR: concernsKo,
            en_US: concernsEn,
            th_TH: concernsTh,
            zh_TW: concernsZhTW,
            ja_JP: concernsJaJP,
            hi_IN: concernsHiIN,
            tl_PH: concernsTlPH,
            ar_SA: concernsArSA,
            ru_RU:
              tr.concerns_ru_RU ||
              getTextByLocale(review.concernsMultilingual, 'ru_RU') ||
              concernsKo,
          };
        }

        existingResults.push(translatedReview);
      }

      progress.processedCount = processedCount + reviews.length;
      progress.lastProcessedId = reviews[reviews.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();
      saveResults(existingResults);
      saveProgress(progress);
      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );
      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 리뷰 러시아어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 리뷰: ${existingResults.length}개`);

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  } catch (error) {
    console.error('❌ 번역 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  translateReviewsToRuRU()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateReviewsToRuRU };
