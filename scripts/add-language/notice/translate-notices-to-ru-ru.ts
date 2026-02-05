import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

const OUTPUT_FILE = path.join(__dirname, 'output/translated-notices-ru-ru.json');
const PROGRESS_FILE = path.join(__dirname, 'output/translation-progress-ru-ru.json');

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

interface TranslatedNotice {
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
}

interface TranslationProgress {
  processedCount: number;
  totalCount: number;
  lastProcessedId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

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

function saveResults(results: TranslatedNotice[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

function loadExistingResults(): TranslatedNotice[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading existing results:', error);
  }
  return [];
}

async function translateNoticesToRuRU() {
  try {
    console.log('🌐 공지사항(Notice) 러시아어(ru-RU) 번역 작업 시작...');

    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((n) => n.id));

    const allNotices = await prisma.notice.findMany({
      select: { id: true, title: true, content: true },
      orderBy: { createdAt: 'asc' },
    });

    const noticesToTranslate = allNotices.filter((notice) => {
      if (existingIds.has(notice.id)) return false;
      return needsRuRUTranslation(notice.title) || needsRuRUTranslation(notice.content);
    });

    const totalCount = noticesToTranslate.length;
    console.log(
      `📊 총 ${allNotices.length}개 공지사항 중 ${totalCount}개 공지사항이 러시아어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 공지사항이 없습니다.');
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

      const notices = noticesToTranslate.slice(processedCount, processedCount + BATCH_SIZE);
      if (notices.length === 0) break;

      const textsToTranslate: {
        id: string;
        type: 'title' | 'content';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const notice of notices) {
        if (needsRuRUTranslation(notice.title)) {
          const sourceText = getSourceText(notice.title);
          if (sourceText) {
            const current = notice.title as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({ id: notice.id, type: 'title', text: sourceText, sourceLang });
          }
        }
        if (needsRuRUTranslation(notice.content)) {
          const sourceText = getSourceText(notice.content);
          if (sourceText) {
            const current = notice.content as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: notice.id,
              type: 'content',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      const translationResults: {
        [key: string]: { title_ru_RU?: string; content_ru_RU?: string };
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
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (individualError) {
                console.error(`개별 번역 실패 (${item.id}, ${item.type}):`, individualError);
              }
            }
          }
        }
      }

      for (const notice of notices) {
        const titleKo = getTextByLocale(notice.title, 'ko_KR');
        const titleEn = getTextByLocale(notice.title, 'en_US');
        const titleTh = getTextByLocale(notice.title, 'th_TH');
        const titleZhTW = getTextByLocale(notice.title, 'zh_TW');
        const titleJaJP = getTextByLocale(notice.title, 'ja_JP');
        const titleHiIN = getTextByLocale(notice.title, 'hi_IN');
        const titleTlPH = getTextByLocale(notice.title, 'tl_PH');
        const titleArSA = getTextByLocale(notice.title, 'ar_SA');
        const contentKo = getTextByLocale(notice.content, 'ko_KR');
        const contentEn = getTextByLocale(notice.content, 'en_US');
        const contentTh = getTextByLocale(notice.content, 'th_TH');
        const contentZhTW = getTextByLocale(notice.content, 'zh_TW');
        const contentJaJP = getTextByLocale(notice.content, 'ja_JP');
        const contentHiIN = getTextByLocale(notice.content, 'hi_IN');
        const contentTlPH = getTextByLocale(notice.content, 'tl_PH');
        const contentArSA = getTextByLocale(notice.content, 'ar_SA');
        const tr = translationResults[notice.id] || {};

        const translatedNotice: TranslatedNotice = {
          id: notice.id,
          title: {
            ko_KR: titleKo,
            en_US: titleEn,
            th_TH: titleTh,
            zh_TW: titleZhTW,
            ja_JP: titleJaJP,
            hi_IN: titleHiIN,
            tl_PH: titleTlPH,
            ar_SA: titleArSA,
            ru_RU: tr.title_ru_RU || getTextByLocale(notice.title, 'ru_RU') || titleKo,
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
            ru_RU: tr.content_ru_RU || getTextByLocale(notice.content, 'ru_RU') || contentKo,
          },
        };
        existingResults.push(translatedNotice);
      }

      progress.processedCount = processedCount + notices.length;
      progress.lastProcessedId = notices[notices.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();
      saveResults(existingResults);
      saveProgress(progress);
      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );
      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 공지사항 러시아어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 공지사항: ${existingResults.length}개`);

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  } catch (error) {
    console.error('❌ 번역 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  translateNoticesToRuRU()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateNoticesToRuRU };
