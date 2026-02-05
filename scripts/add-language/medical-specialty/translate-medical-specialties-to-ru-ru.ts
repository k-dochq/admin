import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

const OUTPUT_FILE = path.join(__dirname, 'output/translated-medical-specialties-ru-ru.json');
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

interface TranslatedMedicalSpecialty {
  id: string;
  name: {
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
  description?: {
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

function saveResults(results: TranslatedMedicalSpecialty[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

function loadExistingResults(): TranslatedMedicalSpecialty[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading existing results:', error);
  }
  return [];
}

async function translateMedicalSpecialtiesToRuRU() {
  try {
    console.log('🌐 시술부위(MedicalSpecialty) 러시아어(ru-RU) 번역 작업 시작...');

    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((ms) => ms.id));

    const allMedicalSpecialties = await prisma.medicalSpecialty.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { createdAt: 'asc' },
    });

    const medicalSpecialtiesToTranslate = allMedicalSpecialties.filter((ms) => {
      if (existingIds.has(ms.id)) return false;
      return (
        needsRuRUTranslation(ms.name) || (ms.description && needsRuRUTranslation(ms.description))
      );
    });

    const totalCount = medicalSpecialtiesToTranslate.length;
    console.log(
      `📊 총 ${allMedicalSpecialties.length}개 시술부위 중 ${totalCount}개 시술부위가 러시아어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 시술부위가 없습니다.');
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

      const medicalSpecialties = medicalSpecialtiesToTranslate.slice(
        processedCount,
        processedCount + BATCH_SIZE,
      );
      if (medicalSpecialties.length === 0) break;

      const textsToTranslate: {
        id: string;
        type: 'name' | 'description';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const ms of medicalSpecialties) {
        if (needsRuRUTranslation(ms.name)) {
          const sourceText = getSourceText(ms.name);
          if (sourceText) {
            const current = ms.name as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({ id: ms.id, type: 'name', text: sourceText, sourceLang });
          }
        }
        if (ms.description && needsRuRUTranslation(ms.description)) {
          const sourceText = getSourceText(ms.description);
          if (sourceText) {
            const current = ms.description as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: ms.id,
              type: 'description',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      const translationResults: {
        [key: string]: { name_ru_RU?: string; description_ru_RU?: string };
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
              if (item.type === 'name')
                translationResults[item.id].name_ru_RU = ruRUTranslations[index];
              else if (item.type === 'description')
                translationResults[item.id].description_ru_RU = ruRUTranslations[index];
            });
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`배치 번역 실패:`, error);
            for (const item of batch) {
              try {
                if (!translationResults[item.id]) translationResults[item.id] = {};
                const ruRUTranslation = await translateText(item.text, item.sourceLang, 'ru');
                if (item.type === 'name') translationResults[item.id].name_ru_RU = ruRUTranslation;
                else if (item.type === 'description')
                  translationResults[item.id].description_ru_RU = ruRUTranslation;
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (individualError) {
                console.error(`개별 번역 실패 (${item.id}, ${item.type}):`, individualError);
              }
            }
          }
        }
      }

      for (const ms of medicalSpecialties) {
        const nameKo = getTextByLocale(ms.name, 'ko_KR');
        const nameEn = getTextByLocale(ms.name, 'en_US');
        const nameTh = getTextByLocale(ms.name, 'th_TH');
        const nameZhTW = getTextByLocale(ms.name, 'zh_TW');
        const nameJaJP = getTextByLocale(ms.name, 'ja_JP');
        const nameHiIN = getTextByLocale(ms.name, 'hi_IN');
        const nameTlPH = getTextByLocale(ms.name, 'tl_PH');
        const nameArSA = getTextByLocale(ms.name, 'ar_SA');
        const tr = translationResults[ms.id] || {};

        const translatedMedicalSpecialty: TranslatedMedicalSpecialty = {
          id: ms.id,
          name: {
            ko_KR: nameKo,
            en_US: nameEn,
            th_TH: nameTh,
            zh_TW: nameZhTW,
            ja_JP: nameJaJP,
            hi_IN: nameHiIN,
            tl_PH: nameTlPH,
            ar_SA: nameArSA,
            ru_RU: tr.name_ru_RU || getTextByLocale(ms.name, 'ru_RU') || nameKo,
          },
        };

        if (ms.description) {
          translatedMedicalSpecialty.description = {
            ko_KR: getTextByLocale(ms.description, 'ko_KR'),
            en_US: getTextByLocale(ms.description, 'en_US'),
            th_TH: getTextByLocale(ms.description, 'th_TH'),
            zh_TW: getTextByLocale(ms.description, 'zh_TW'),
            ja_JP: getTextByLocale(ms.description, 'ja_JP'),
            hi_IN: getTextByLocale(ms.description, 'hi_IN'),
            tl_PH: getTextByLocale(ms.description, 'tl_PH'),
            ar_SA: getTextByLocale(ms.description, 'ar_SA'),
            ru_RU:
              tr.description_ru_RU ||
              getTextByLocale(ms.description, 'ru_RU') ||
              getTextByLocale(ms.description, 'ko_KR'),
          };
        }

        existingResults.push(translatedMedicalSpecialty);
      }

      progress.processedCount = processedCount + medicalSpecialties.length;
      progress.lastProcessedId = medicalSpecialties[medicalSpecialties.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();
      saveResults(existingResults);
      saveProgress(progress);
      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );
      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 시술부위 러시아어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 시술부위: ${existingResults.length}개`);

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  } catch (error) {
    console.error('❌ 번역 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  translateMedicalSpecialtiesToRuRU()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateMedicalSpecialtiesToRuRU };
