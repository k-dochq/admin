import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-live-reviews-tl-ph.json');
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
interface TranslatedLiveReview {
  id: string;
  content: {
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
function saveResults(results: TranslatedLiveReview[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedLiveReview[] {
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
async function translateLiveReviewsToTlPH() {
  try {
    console.log('🌐 실시간 리뷰(LiveReview) 필리핀어(tl-PH) 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((lr) => lr.id));

    // 모든 실시간 리뷰 조회
    const allLiveReviews = await prisma.liveReview.findMany({
      select: {
        id: true,
        content: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 실시간 리뷰만 필터링 (tl_PH가 없거나 비어있는 경우)
    const liveReviewsToTranslate = allLiveReviews.filter((liveReview) => {
      // 이미 처리된 실시간 리뷰는 제외
      if (existingIds.has(liveReview.id)) {
        return false;
      }

      // content 번역이 필요하면 포함
      return needsTlPHTranslation(liveReview.content);
    });

    const totalCount = liveReviewsToTranslate.length;
    console.log(
      `📊 총 ${allLiveReviews.length}개 실시간 리뷰 중 ${totalCount}개 실시간 리뷰가 필리핀어 번역이 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 번역이 필요한 실시간 리뷰가 없습니다.');
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

      // 번역이 필요한 실시간 리뷰 배치 가져오기
      const liveReviews = liveReviewsToTranslate.slice(processedCount, processedCount + BATCH_SIZE);

      if (liveReviews.length === 0) break;

      // 번역할 텍스트 수집
      const textsToTranslate: {
        id: string;
        type: 'content';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const liveReview of liveReviews) {
        // content 번역
        if (needsTlPHTranslation(liveReview.content)) {
          const sourceText = getSourceText(liveReview.content);
          if (sourceText) {
            const currentContent = liveReview.content as LocalizedText;
            const sourceLang = currentContent.ko_KR ? 'ko' : currentContent.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: liveReview.id,
              type: 'content',
              text: sourceText,
              sourceLang,
            });
          }
        }
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          content_tl_PH?: string;
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

              if (item.type === 'content') {
                translationResults[item.id].content_tl_PH = tlPHTranslations[index];
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

                if (item.type === 'content') {
                  translationResults[item.id].content_tl_PH = tlPHTranslation;
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
      for (const liveReview of liveReviews) {
        const contentKo = getTextByLocale(liveReview.content, 'ko_KR');
        const contentEn = getTextByLocale(liveReview.content, 'en_US');
        const contentTh = getTextByLocale(liveReview.content, 'th_TH');
        const contentZhTW = getTextByLocale(liveReview.content, 'zh_TW');
        const contentJaJP = getTextByLocale(liveReview.content, 'ja_JP');
        const contentHiIN = getTextByLocale(liveReview.content, 'hi_IN');

        const translations = translationResults[liveReview.id] || {};

        const translatedLiveReview: TranslatedLiveReview = {
          id: liveReview.id,
          content: {
            ko_KR: contentKo,
            en_US: contentEn,
            th_TH: contentTh,
            zh_TW: contentZhTW,
            ja_JP: contentJaJP,
            hi_IN: contentHiIN,
            tl_PH:
              translations.content_tl_PH ||
              getTextByLocale(liveReview.content, 'tl_PH') ||
              contentKo,
          },
        };

        existingResults.push(translatedLiveReview);
      }

      // 진행 상황 업데이트
      progress.processedCount = processedCount + liveReviews.length;
      progress.lastProcessedId = liveReviews[liveReviews.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 실시간 리뷰 필리핀어 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 실시간 리뷰: ${existingResults.length}개`);

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
  translateLiveReviewsToTlPH()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateLiveReviewsToTlPH };
