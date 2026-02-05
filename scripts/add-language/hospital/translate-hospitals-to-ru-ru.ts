import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-hospitals-ru-ru.json');
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
interface TranslatedHospital {
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
  address: {
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
  directions?: {
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
  displayLocationName?: {
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

function saveResults(results: TranslatedHospital[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

function loadExistingResults(): TranslatedHospital[] {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading existing results:', error);
  }
  return [];
}

async function translateHospitalsToRuRU() {
  try {
    console.log('🌐 병원 러시아어(ru-RU) 번역 작업 시작...');

    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((h) => h.id));

    const allHospitals = await prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        directions: true,
        description: true,
        displayLocationName: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const hospitalsToTranslate = allHospitals.filter((hospital) => {
      if (existingIds.has(hospital.id)) return false;
      return (
        needsRuRUTranslation(hospital.name) ||
        needsRuRUTranslation(hospital.address) ||
        (hospital.directions && needsRuRUTranslation(hospital.directions)) ||
        (hospital.description && needsRuRUTranslation(hospital.description)) ||
        (hospital.displayLocationName && needsRuRUTranslation(hospital.displayLocationName))
      );
    });

    const totalCount = hospitalsToTranslate.length;
    console.log(
      `📊 총 ${allHospitals.length}개 병원 중 ${totalCount}개 병원이 러시아어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 병원이 없습니다.');
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

      const hospitals = hospitalsToTranslate.slice(processedCount, processedCount + BATCH_SIZE);
      if (hospitals.length === 0) break;

      const textsToTranslate: {
        id: string;
        type: 'name' | 'address' | 'directions' | 'description' | 'displayLocationName';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const hospital of hospitals) {
        if (needsRuRUTranslation(hospital.name)) {
          const sourceText = getSourceText(hospital.name);
          if (sourceText) {
            const current = hospital.name as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({ id: hospital.id, type: 'name', text: sourceText, sourceLang });
          }
        }
        if (needsRuRUTranslation(hospital.address)) {
          const sourceText = getSourceText(hospital.address);
          if (sourceText) {
            const current = hospital.address as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: hospital.id,
              type: 'address',
              text: sourceText,
              sourceLang,
            });
          }
        }
        if (hospital.directions && needsRuRUTranslation(hospital.directions)) {
          const sourceText = getSourceText(hospital.directions);
          if (sourceText) {
            const current = hospital.directions as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: hospital.id,
              type: 'directions',
              text: sourceText,
              sourceLang,
            });
          }
        }
        if (hospital.description && needsRuRUTranslation(hospital.description)) {
          const sourceText = getSourceText(hospital.description);
          if (sourceText) {
            const current = hospital.description as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: hospital.id,
              type: 'description',
              text: sourceText,
              sourceLang,
            });
          }
        }
        if (hospital.displayLocationName && needsRuRUTranslation(hospital.displayLocationName)) {
          const sourceText = getSourceText(hospital.displayLocationName);
          if (sourceText) {
            const current = hospital.displayLocationName as LocalizedText;
            const sourceLang = current.ko_KR ? 'ko' : current.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: hospital.id,
              type: 'displayLocationName',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      const translationResults: {
        [key: string]: {
          name_ru_RU?: string;
          address_ru_RU?: string;
          directions_ru_RU?: string;
          description_ru_RU?: string;
          displayLocationName_ru_RU?: string;
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
              if (item.type === 'name')
                translationResults[item.id].name_ru_RU = ruRUTranslations[index];
              else if (item.type === 'address')
                translationResults[item.id].address_ru_RU = ruRUTranslations[index];
              else if (item.type === 'directions')
                translationResults[item.id].directions_ru_RU = ruRUTranslations[index];
              else if (item.type === 'description')
                translationResults[item.id].description_ru_RU = ruRUTranslations[index];
              else if (item.type === 'displayLocationName')
                translationResults[item.id].displayLocationName_ru_RU = ruRUTranslations[index];
            });
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`배치 번역 실패:`, error);
            for (const item of batch) {
              try {
                if (!translationResults[item.id]) translationResults[item.id] = {};
                const ruRUTranslation = await translateText(item.text, item.sourceLang, 'ru');
                if (item.type === 'name') translationResults[item.id].name_ru_RU = ruRUTranslation;
                else if (item.type === 'address')
                  translationResults[item.id].address_ru_RU = ruRUTranslation;
                else if (item.type === 'directions')
                  translationResults[item.id].directions_ru_RU = ruRUTranslation;
                else if (item.type === 'description')
                  translationResults[item.id].description_ru_RU = ruRUTranslation;
                else if (item.type === 'displayLocationName')
                  translationResults[item.id].displayLocationName_ru_RU = ruRUTranslation;
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (individualError) {
                console.error(`개별 번역 실패 (${item.id}, ${item.type}):`, individualError);
              }
            }
          }
        }
      }

      for (const hospital of hospitals) {
        const tr = translationResults[hospital.id] || {};
        const nameKo = getTextByLocale(hospital.name, 'ko_KR');
        const nameEn = getTextByLocale(hospital.name, 'en_US');
        const nameTh = getTextByLocale(hospital.name, 'th_TH');
        const nameZhTW = getTextByLocale(hospital.name, 'zh_TW');
        const nameJaJP = getTextByLocale(hospital.name, 'ja_JP');
        const nameHiIN = getTextByLocale(hospital.name, 'hi_IN');
        const nameTlPH = getTextByLocale(hospital.name, 'tl_PH');
        const nameArSA = getTextByLocale(hospital.name, 'ar_SA');
        const addressKo = getTextByLocale(hospital.address, 'ko_KR');
        const addressEn = getTextByLocale(hospital.address, 'en_US');
        const addressTh = getTextByLocale(hospital.address, 'th_TH');
        const addressZhTW = getTextByLocale(hospital.address, 'zh_TW');
        const addressJaJP = getTextByLocale(hospital.address, 'ja_JP');
        const addressHiIN = getTextByLocale(hospital.address, 'hi_IN');
        const addressTlPH = getTextByLocale(hospital.address, 'tl_PH');
        const addressArSA = getTextByLocale(hospital.address, 'ar_SA');

        const translatedHospital: TranslatedHospital = {
          id: hospital.id,
          name: {
            ko_KR: nameKo,
            en_US: nameEn,
            th_TH: nameTh,
            zh_TW: nameZhTW,
            ja_JP: nameJaJP,
            hi_IN: nameHiIN,
            tl_PH: nameTlPH,
            ar_SA: nameArSA,
            ru_RU: tr.name_ru_RU || getTextByLocale(hospital.name, 'ru_RU') || nameKo,
          },
          address: {
            ko_KR: addressKo,
            en_US: addressEn,
            th_TH: addressTh,
            zh_TW: addressZhTW,
            ja_JP: addressJaJP,
            hi_IN: addressHiIN,
            tl_PH: addressTlPH,
            ar_SA: addressArSA,
            ru_RU: tr.address_ru_RU || getTextByLocale(hospital.address, 'ru_RU') || addressKo,
          },
        };

        if (hospital.directions) {
          translatedHospital.directions = {
            ko_KR: getTextByLocale(hospital.directions, 'ko_KR'),
            en_US: getTextByLocale(hospital.directions, 'en_US'),
            th_TH: getTextByLocale(hospital.directions, 'th_TH'),
            zh_TW: getTextByLocale(hospital.directions, 'zh_TW'),
            ja_JP: getTextByLocale(hospital.directions, 'ja_JP'),
            hi_IN: getTextByLocale(hospital.directions, 'hi_IN'),
            tl_PH: getTextByLocale(hospital.directions, 'tl_PH'),
            ar_SA: getTextByLocale(hospital.directions, 'ar_SA'),
            ru_RU:
              tr.directions_ru_RU ||
              getTextByLocale(hospital.directions, 'ru_RU') ||
              getTextByLocale(hospital.directions, 'ko_KR'),
          };
        }
        if (hospital.description) {
          translatedHospital.description = {
            ko_KR: getTextByLocale(hospital.description, 'ko_KR'),
            en_US: getTextByLocale(hospital.description, 'en_US'),
            th_TH: getTextByLocale(hospital.description, 'th_TH'),
            zh_TW: getTextByLocale(hospital.description, 'zh_TW'),
            ja_JP: getTextByLocale(hospital.description, 'ja_JP'),
            hi_IN: getTextByLocale(hospital.description, 'hi_IN'),
            tl_PH: getTextByLocale(hospital.description, 'tl_PH'),
            ar_SA: getTextByLocale(hospital.description, 'ar_SA'),
            ru_RU:
              tr.description_ru_RU ||
              getTextByLocale(hospital.description, 'ru_RU') ||
              getTextByLocale(hospital.description, 'ko_KR'),
          };
        }
        if (hospital.displayLocationName) {
          translatedHospital.displayLocationName = {
            ko_KR: getTextByLocale(hospital.displayLocationName, 'ko_KR'),
            en_US: getTextByLocale(hospital.displayLocationName, 'en_US'),
            th_TH: getTextByLocale(hospital.displayLocationName, 'th_TH'),
            zh_TW: getTextByLocale(hospital.displayLocationName, 'zh_TW'),
            ja_JP: getTextByLocale(hospital.displayLocationName, 'ja_JP'),
            hi_IN: getTextByLocale(hospital.displayLocationName, 'hi_IN'),
            tl_PH: getTextByLocale(hospital.displayLocationName, 'tl_PH'),
            ar_SA: getTextByLocale(hospital.displayLocationName, 'ar_SA'),
            ru_RU:
              tr.displayLocationName_ru_RU ||
              getTextByLocale(hospital.displayLocationName, 'ru_RU') ||
              getTextByLocale(hospital.displayLocationName, 'ko_KR'),
          };
        }

        existingResults.push(translatedHospital);
      }

      progress.processedCount = processedCount + hospitals.length;
      progress.lastProcessedId = hospitals[hospitals.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();
      saveResults(existingResults);
      saveProgress(progress);
      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );
      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 병원 러시아어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 병원: ${existingResults.length}개`);

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
  } catch (error) {
    console.error('❌ 번역 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  translateHospitalsToRuRU()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateHospitalsToRuRU };
