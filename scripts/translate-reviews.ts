import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyBiNzG9ERTywmtzap6sQ0KjrD4FU5uQxzg';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, '../output/translated-reviews.json');
const PROGRESS_FILE = path.join(__dirname, '../output/translation-progress.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

// 번역 결과 타입
interface TranslatedReview {
  id: string;
  title: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  content: {
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
 * LocalizedText에서 한국어 텍스트 추출
 */
function getKoreanText(localizedText: Prisma.JsonValue): string {
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
 * 영어/태국어에 한글이 포함되어 있는지 확인하는 함수
 */
function needsTranslation(localizedText: Prisma.JsonValue): boolean {
  if (!localizedText) return false;
  if (typeof localizedText === 'string') return false;

  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    const koText = text.ko_KR || '';
    const enText = text.en_US || '';
    const thText = text.th_TH || '';

    // 한글이 있고, 영어나 태국어에 한글이 포함되어 있으면 번역 필요
    if (!koText) return false;

    // 한글 문자 정규식 (가-힣, ㄱ-ㅎ, ㅏ-ㅣ)
    const koreanRegex = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

    // 영어나 태국어 필드에 한글이 포함되어 있는지 확인
    const enHasKorean = enText && koreanRegex.test(enText);
    const thHasKorean = thText && koreanRegex.test(thText);

    return enHasKorean || thHasKorean;
  }

  return false;
}

/**
 * 메인 번역 함수
 */
async function translateReviews() {
  try {
    console.log('🌐 리뷰 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();

    // 번역이 필요한 리뷰만 조회
    const allReviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 리뷰만 필터링
    const reviewsToTranslate = allReviews.filter(
      (review) => needsTranslation(review.title) || needsTranslation(review.content),
    );

    const totalCount = reviewsToTranslate.length;
    console.log(`📊 총 ${allReviews.length}개 리뷰 중 ${totalCount}개 리뷰가 번역이 필요합니다.`);

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

      // 번역할 텍스트 수집 (한글과 동일한 영어/태국어만)
      const textsToTranslate: { id: string; type: 'title' | 'content'; text: string }[] = [];

      for (const review of reviews) {
        const titleKo = getKoreanText(review.title);
        const contentKo = getKoreanText(review.content);

        // 제목이 번역이 필요한 경우만 추가
        if (titleKo && needsTranslation(review.title)) {
          textsToTranslate.push({ id: review.id, type: 'title', text: titleKo });
        }
        // 내용이 번역이 필요한 경우만 추가
        if (contentKo && needsTranslation(review.content)) {
          textsToTranslate.push({ id: review.id, type: 'content', text: contentKo });
        }
      }

      // 배치별로 번역 처리
      const translationResults: {
        [key: string]: {
          title_en?: string;
          title_th?: string;
          content_en?: string;
          content_th?: string;
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
            if (!translationResults[item.id]) {
              translationResults[item.id] = {};
            }

            if (item.type === 'title') {
              translationResults[item.id].title_en = englishTranslations[index];
              translationResults[item.id].title_th = thaiTranslations[index];
            } else {
              translationResults[item.id].content_en = englishTranslations[index];
              translationResults[item.id].content_th = thaiTranslations[index];
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

              const englishTranslation = await translateText(item.text, 'ko', 'en');
              const thaiTranslation = await translateText(item.text, 'ko', 'th');

              if (item.type === 'title') {
                translationResults[item.id].title_en = englishTranslation;
                translationResults[item.id].title_th = thaiTranslation;
              } else {
                translationResults[item.id].content_en = englishTranslation;
                translationResults[item.id].content_th = thaiTranslation;
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
            } catch (individualError) {
              console.error(`개별 번역 실패 (${item.id}):`, individualError);
            }
          }
        }
      }

      // 데이터베이스 업데이트
      for (const review of reviews) {
        const titleKo = getKoreanText(review.title);
        const contentKo = getKoreanText(review.content);
        const translations = translationResults[review.id] || {};

        // 업데이트할 데이터 구성
        const updateData: any = {};

        // 제목 업데이트
        if (translations.title_en || translations.title_th) {
          const currentTitle = review.title as LocalizedText;
          updateData.title = {
            ko_KR: titleKo,
            en_US: translations.title_en || currentTitle.en_US || titleKo,
            th_TH: translations.title_th || currentTitle.th_TH || titleKo,
          };
        }

        // 내용 업데이트
        if (translations.content_en || translations.content_th) {
          const currentContent = review.content as LocalizedText;
          updateData.content = {
            ko_KR: contentKo,
            en_US: translations.content_en || currentContent.en_US || contentKo,
            th_TH: translations.content_th || currentContent.th_TH || contentKo,
          };
        }

        // 데이터베이스 업데이트
        if (Object.keys(updateData).length > 0) {
          await prisma.review.update({
            where: { id: review.id },
            data: updateData,
          });
          console.log(`✅ 리뷰 ${review.id} 번역 업데이트 완료`);
        }

        // 결과 파일용 데이터 구성
        const translatedReview: TranslatedReview = {
          id: review.id,
          title: {
            ko_KR: titleKo,
            en_US: translations.title_en || (review.title as LocalizedText).en_US || titleKo,
            th_TH: translations.title_th || (review.title as LocalizedText).th_TH || titleKo,
          },
          content: {
            ko_KR: contentKo,
            en_US: translations.content_en || (review.content as LocalizedText).en_US || contentKo,
            th_TH: translations.content_th || (review.content as LocalizedText).th_TH || contentKo,
          },
        };

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

    console.log('\n🎉 모든 리뷰 번역 완료!');
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
  translateReviews()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateReviews };
