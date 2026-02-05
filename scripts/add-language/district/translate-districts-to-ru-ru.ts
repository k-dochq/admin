import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-districts-ru-ru.json');
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
interface TranslatedDistrict {
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
  displayName?: {
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
 * ru_RU 번역이 필요한지 확인
 */
function needsRuRUTranslation(localizedText: Prisma.JsonValue): boolean {
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
    const ruRUText = text.ru_RU;

    // 소스 텍스트가 있고, ru_RU가 없거나 비어있으면 번역 필요
    return !!sourceText && (!ruRUText || ruRUText.trim() === '');
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
function saveResults(results: TranslatedDistrict[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedDistrict[] {
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
async function translateDistrictsToRuRU() {
  try {
    console.log('🌐 지역(District) 러시아어(ru-RU) 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((d) => d.id));

    // 모든 지역 조회
    const allDistricts = await prisma.district.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 지역만 필터링 (ru_RU가 없거나 비어있는 경우)
    const districtsToTranslate = allDistricts.filter((district) => {
      // 이미 처리된 지역은 제외
      if (existingIds.has(district.id)) {
        return false;
      }

      // name, displayName 중 하나라도 번역이 필요하면 포함
      return (
        needsRuRUTranslation(district.name) ||
        (district.displayName && needsRuRUTranslation(district.displayName))
      );
    });

    const totalCount = districtsToTranslate.length;
    console.log(
      `📊 총 ${allDistricts.length}개 지역 중 ${totalCount}개 지역이 러시아어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 지역이 없습니다.');
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

      // 번역이 필요한 지역 배치 가져오기
      const districts = districtsToTranslate.slice(processedCount, processedCount + BATCH_SIZE);

      if (districts.length === 0) break;

      // 번역할 텍스트 수집
      const textsToTranslate: {
        id: string;
        type: 'name' | 'displayName';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const district of districts) {
        // name 번역
        if (needsRuRUTranslation(district.name)) {
          const sourceText = getSourceText(district.name);
          if (sourceText) {
            const currentName = district.name as LocalizedText;
            const sourceLang = currentName.ko_KR ? 'ko' : currentName.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: district.id,
              type: 'name',
              text: sourceText,
              sourceLang,
            });
          }
        }

        // displayName 번역
        if (district.displayName && needsRuRUTranslation(district.displayName)) {
          const sourceText = getSourceText(district.displayName);
          if (sourceText) {
            const currentDisplayName = district.displayName as LocalizedText;
            const sourceLang = currentDisplayName.ko_KR
              ? 'ko'
              : currentDisplayName.en_US
                ? 'en'
                : 'th';
            textsToTranslate.push({
              id: district.id,
              type: 'displayName',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          name_ru_RU?: string;
          displayName_ru_RU?: string;
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
              `  🔄 러시아어 번역 중... (${sourceLang} → ru) (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, items.length)}/${items.length})`,
            );
            const ruRUTranslations = await translateBatch(texts, sourceLang, 'ru');

            // 결과 저장
            batch.forEach((item, index) => {
              if (!translationResults[item.id]) {
                translationResults[item.id] = {};
              }

              if (item.type === 'name') {
                translationResults[item.id].name_ru_RU = ruRUTranslations[index];
              } else if (item.type === 'displayName') {
                translationResults[item.id].displayName_ru_RU = ruRUTranslations[index];
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

                const ruRUTranslation = await translateText(item.text, item.sourceLang, 'ru');

                if (item.type === 'name') {
                  translationResults[item.id].name_ru_RU = ruRUTranslation;
                } else if (item.type === 'displayName') {
                  translationResults[item.id].displayName_ru_RU = ruRUTranslation;
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
      for (const district of districts) {
        const nameKo = getTextByLocale(district.name, 'ko_KR');
        const nameEn = getTextByLocale(district.name, 'en_US');
        const nameTh = getTextByLocale(district.name, 'th_TH');
        const nameZhTW = getTextByLocale(district.name, 'zh_TW');
        const nameJaJP = getTextByLocale(district.name, 'ja_JP');
        const nameHiIN = getTextByLocale(district.name, 'hi_IN');
        const nameTlPH = getTextByLocale(district.name, 'tl_PH');
        const nameArSA = getTextByLocale(district.name, 'ar_SA');

        const translations = translationResults[district.id] || {};

        const translatedDistrict: TranslatedDistrict = {
          id: district.id,
          name: {
            ko_KR: nameKo,
            en_US: nameEn,
            th_TH: nameTh,
            zh_TW: nameZhTW,
            ja_JP: nameJaJP,
            hi_IN: nameHiIN,
            tl_PH: nameTlPH,
            ar_SA: nameArSA,
            ru_RU: translations.name_ru_RU || getTextByLocale(district.name, 'ru_RU') || nameKo,
          },
        };

        // displayName 처리
        if (district.displayName) {
          const displayNameKo = getTextByLocale(district.displayName, 'ko_KR');
          const displayNameEn = getTextByLocale(district.displayName, 'en_US');
          const displayNameTh = getTextByLocale(district.displayName, 'th_TH');
          const displayNameZhTW = getTextByLocale(district.displayName, 'zh_TW');
          const displayNameJaJP = getTextByLocale(district.displayName, 'ja_JP');
          const displayNameHiIN = getTextByLocale(district.displayName, 'hi_IN');
          const displayNameTlPH = getTextByLocale(district.displayName, 'tl_PH');
          const displayNameArSA = getTextByLocale(district.displayName, 'ar_SA');

          translatedDistrict.displayName = {
            ko_KR: displayNameKo,
            en_US: displayNameEn,
            th_TH: displayNameTh,
            zh_TW: displayNameZhTW,
            ja_JP: displayNameJaJP,
            hi_IN: displayNameHiIN,
            tl_PH: displayNameTlPH,
            ar_SA: displayNameArSA,
            ru_RU:
              translations.displayName_ru_RU ||
              getTextByLocale(district.displayName, 'ru_RU') ||
              displayNameKo,
          };
        }

        existingResults.push(translatedDistrict);
      }

      // 진행 상황 업데이트
      progress.processedCount = processedCount + districts.length;
      progress.lastProcessedId = districts[districts.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 지역 러시아어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 지역: ${existingResults.length}개`);

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
  translateDistrictsToRuRU()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateDistrictsToRuRU };
