import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-medical-specialties-tl-ph.json');
const PROGRESS_FILE = path.join(__dirname, 'output/translation-progress-tl-ph.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
  hi_IN?: string;
  tl_PH?: string;
};

// 번역 결과 타입
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
  };
  description?: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
    ja_JP: string;
    hi_IN: string;
    tl_PH: string;
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
 * tl_PH 번역이 필요한지 확인
 */
function needsTlPHTranslation(localizedText: Prisma.JsonValue): boolean {
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
    const tlPHText = text.tl_PH;

    // 소스 텍스트가 있고, tl_PH가 없거나 비어있으면 번역 필요
    return !!sourceText && (!tlPHText || tlPHText.trim() === '');
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
function saveResults(results: TranslatedMedicalSpecialty[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedMedicalSpecialty[] {
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
async function translateMedicalSpecialtiesToTlPH() {
  try {
    console.log('🌐 시술부위(MedicalSpecialty) 필리핀어(tl-PH) 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((ms) => ms.id));

    // 모든 시술부위 조회
    const allMedicalSpecialties = await prisma.medicalSpecialty.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 시술부위만 필터링 (tl_PH가 없거나 비어있는 경우)
    const medicalSpecialtiesToTranslate = allMedicalSpecialties.filter((medicalSpecialty) => {
      // 이미 처리된 시술부위는 제외
      if (existingIds.has(medicalSpecialty.id)) {
        return false;
      }

      // name, description 중 하나라도 번역이 필요하면 포함
      return (
        needsTlPHTranslation(medicalSpecialty.name) ||
        (medicalSpecialty.description && needsTlPHTranslation(medicalSpecialty.description))
      );
    });

    const totalCount = medicalSpecialtiesToTranslate.length;
    console.log(
      `📊 총 ${allMedicalSpecialties.length}개 시술부위 중 ${totalCount}개 시술부위가 필리핀어 번역이 필요합니다.`,
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

    // 배치 크기 설정 (API 요청 횟수 절약을 위해)
    const BATCH_SIZE = 10;
    const TRANSLATION_BATCH_SIZE = 5; // Google Translate API 배치 크기

    let processedCount = progress.processedCount;

    while (processedCount < totalCount) {
      console.log(
        `\n📝 처리 중: ${processedCount + 1}-${Math.min(processedCount + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      // 번역이 필요한 시술부위 배치 가져오기
      const medicalSpecialties = medicalSpecialtiesToTranslate.slice(
        processedCount,
        processedCount + BATCH_SIZE,
      );

      if (medicalSpecialties.length === 0) break;

      // 번역할 텍스트 수집
      const textsToTranslate: {
        id: string;
        type: 'name' | 'description';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const medicalSpecialty of medicalSpecialties) {
        // name 번역
        if (needsTlPHTranslation(medicalSpecialty.name)) {
          const sourceText = getSourceText(medicalSpecialty.name);
          if (sourceText) {
            const currentName = medicalSpecialty.name as LocalizedText;
            const sourceLang = currentName.ko_KR ? 'ko' : currentName.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: medicalSpecialty.id,
              type: 'name',
              text: sourceText,
              sourceLang,
            });
          }
        }

        // description 번역
        if (medicalSpecialty.description && needsTlPHTranslation(medicalSpecialty.description)) {
          const sourceText = getSourceText(medicalSpecialty.description);
          if (sourceText) {
            const currentDescription = medicalSpecialty.description as LocalizedText;
            const sourceLang = currentDescription.ko_KR
              ? 'ko'
              : currentDescription.en_US
                ? 'en'
                : 'th';
            textsToTranslate.push({
              id: medicalSpecialty.id,
              type: 'description',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          name_tl_PH?: string;
          description_tl_PH?: string;
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
              `  🔄 필리핀어 번역 중... (${sourceLang} → tl) (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, items.length)}/${items.length})`,
            );
            const tlPHTranslations = await translateBatch(texts, sourceLang, 'tl');

            // 결과 저장
            batch.forEach((item, index) => {
              if (!translationResults[item.id]) {
                translationResults[item.id] = {};
              }

              if (item.type === 'name') {
                translationResults[item.id].name_tl_PH = tlPHTranslations[index];
              } else if (item.type === 'description') {
                translationResults[item.id].description_tl_PH = tlPHTranslations[index];
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

                const tlPHTranslation = await translateText(item.text, item.sourceLang, 'tl');

                if (item.type === 'name') {
                  translationResults[item.id].name_tl_PH = tlPHTranslation;
                } else if (item.type === 'description') {
                  translationResults[item.id].description_tl_PH = tlPHTranslation;
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
      for (const medicalSpecialty of medicalSpecialties) {
        const nameKo = getTextByLocale(medicalSpecialty.name, 'ko_KR');
        const nameEn = getTextByLocale(medicalSpecialty.name, 'en_US');
        const nameTh = getTextByLocale(medicalSpecialty.name, 'th_TH');
        const nameZhTW = getTextByLocale(medicalSpecialty.name, 'zh_TW');
        const nameJaJP = getTextByLocale(medicalSpecialty.name, 'ja_JP');
        const nameHiIN = getTextByLocale(medicalSpecialty.name, 'hi_IN');

        const translations = translationResults[medicalSpecialty.id] || {};

        const translatedMedicalSpecialty: TranslatedMedicalSpecialty = {
          id: medicalSpecialty.id,
          name: {
            ko_KR: nameKo,
            en_US: nameEn,
            th_TH: nameTh,
            zh_TW: nameZhTW,
            ja_JP: nameJaJP,
            hi_IN: nameHiIN,
            tl_PH:
              translations.name_tl_PH ||
              getTextByLocale(medicalSpecialty.name, 'tl_PH') ||
              nameKo,
          },
        };

        // description 처리
        if (medicalSpecialty.description) {
          const descriptionKo = getTextByLocale(medicalSpecialty.description, 'ko_KR');
          const descriptionEn = getTextByLocale(medicalSpecialty.description, 'en_US');
          const descriptionTh = getTextByLocale(medicalSpecialty.description, 'th_TH');
          const descriptionZhTW = getTextByLocale(medicalSpecialty.description, 'zh_TW');
          const descriptionJaJP = getTextByLocale(medicalSpecialty.description, 'ja_JP');
          const descriptionHiIN = getTextByLocale(medicalSpecialty.description, 'hi_IN');

          translatedMedicalSpecialty.description = {
            ko_KR: descriptionKo,
            en_US: descriptionEn,
            th_TH: descriptionTh,
            zh_TW: descriptionZhTW,
            ja_JP: descriptionJaJP,
            hi_IN: descriptionHiIN,
            tl_PH:
              translations.description_tl_PH ||
              getTextByLocale(medicalSpecialty.description, 'tl_PH') ||
              descriptionKo,
          };
        }

        existingResults.push(translatedMedicalSpecialty);
      }

      // 진행 상황 업데이트
      progress.processedCount = processedCount + medicalSpecialties.length;
      progress.lastProcessedId = medicalSpecialties[medicalSpecialties.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 시술부위 필리핀어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 시술부위: ${existingResults.length}개`);

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
  translateMedicalSpecialtiesToTlPH()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateMedicalSpecialtiesToTlPH };
