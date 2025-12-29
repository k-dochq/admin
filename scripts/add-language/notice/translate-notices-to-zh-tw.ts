import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { GOOGLE_TRANSLATE_API_KEY, GOOGLE_TRANSLATE_API_URL } from '../constants';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-notices-zh-tw.json');
const PROGRESS_FILE = path.join(__dirname, 'output/translation-progress-zh-tw.json');

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
};

// 번역 결과 타입
interface TranslatedNotice {
  id: string;
  title: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
  };
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
    zh_TW: string;
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
 * zh_TW 번역이 필요한지 확인
 */
function needsZhTWTranslation(localizedText: Prisma.JsonValue): boolean {
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
    const zhTWText = text.zh_TW;

    // 소스 텍스트가 있고, zh_TW가 없거나 비어있으면 번역 필요
    return !!sourceText && (!zhTWText || zhTWText.trim() === '');
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
function saveResults(results: TranslatedNotice[]): void {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * 기존 결과를 로드하는 함수
 */
function loadExistingResults(): TranslatedNotice[] {
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
async function translateNoticesToZhTW() {
  try {
    console.log('🌐 공지사항(Notice) 중국어 번체(zh-TW) 번역 작업 시작...');

    // 기존 진행 상황 로드
    let progress = loadProgress();
    const existingResults = loadExistingResults();
    const existingIds = new Set(existingResults.map((n) => n.id));

    // 모든 공지사항 조회
    const allNotices = await prisma.notice.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 번역이 필요한 공지사항만 필터링 (zh_TW가 없거나 비어있는 경우)
    const noticesToTranslate = allNotices.filter((notice) => {
      // 이미 처리된 공지사항은 제외
      if (existingIds.has(notice.id)) {
        return false;
      }

      // title, content 중 하나라도 번역이 필요하면 포함
      return needsZhTWTranslation(notice.title) || needsZhTWTranslation(notice.content);
    });

    const totalCount = noticesToTranslate.length;
    console.log(
      `📊 총 ${allNotices.length}개 공지사항 중 ${totalCount}개 공지사항이 중국어 번체 번역이 필요합니다.`,
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

    // 배치 크기 설정 (API 요청 횟수 절약을 위해)
    const BATCH_SIZE = 10;
    const TRANSLATION_BATCH_SIZE = 5; // Google Translate API 배치 크기

    let processedCount = progress.processedCount;

    while (processedCount < totalCount) {
      console.log(
        `\n📝 처리 중: ${processedCount + 1}-${Math.min(processedCount + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      // 번역이 필요한 공지사항 배치 가져오기
      const notices = noticesToTranslate.slice(processedCount, processedCount + BATCH_SIZE);

      if (notices.length === 0) break;

      // 번역할 텍스트 수집
      const textsToTranslate: {
        id: string;
        type: 'title' | 'content';
        text: string;
        sourceLang: 'ko' | 'en' | 'th';
      }[] = [];

      for (const notice of notices) {
        // title 번역
        if (needsZhTWTranslation(notice.title)) {
          const sourceText = getSourceText(notice.title);
          if (sourceText) {
            const currentTitle = notice.title as LocalizedText;
            const sourceLang = currentTitle.ko_KR ? 'ko' : currentTitle.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: notice.id,
              type: 'title',
              text: sourceText,
              sourceLang,
            });
          }
        }

        // content 번역
        if (needsZhTWTranslation(notice.content)) {
          const sourceText = getSourceText(notice.content);
          if (sourceText) {
            const currentContent = notice.content as LocalizedText;
            const sourceLang = currentContent.ko_KR ? 'ko' : currentContent.en_US ? 'en' : 'th';
            textsToTranslate.push({
              id: notice.id,
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
          title_zh_TW?: string;
          content_zh_TW?: string;
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
              `  🔄 중국어 번체 번역 중... (${sourceLang} → zh-TW) (${i + 1}-${Math.min(i + TRANSLATION_BATCH_SIZE, items.length)}/${items.length})`,
            );
            const zhTWTranslations = await translateBatch(texts, sourceLang, 'zh-TW');

            // 결과 저장
            batch.forEach((item, index) => {
              if (!translationResults[item.id]) {
                translationResults[item.id] = {};
              }

              if (item.type === 'title') {
                translationResults[item.id].title_zh_TW = zhTWTranslations[index];
              } else if (item.type === 'content') {
                translationResults[item.id].content_zh_TW = zhTWTranslations[index];
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

                const zhTWTranslation = await translateText(item.text, item.sourceLang, 'zh-TW');

                if (item.type === 'title') {
                  translationResults[item.id].title_zh_TW = zhTWTranslation;
                } else if (item.type === 'content') {
                  translationResults[item.id].content_zh_TW = zhTWTranslation;
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
      for (const notice of notices) {
        const titleKo = getTextByLocale(notice.title, 'ko_KR');
        const titleEn = getTextByLocale(notice.title, 'en_US');
        const titleTh = getTextByLocale(notice.title, 'th_TH');
        const contentKo = getTextByLocale(notice.content, 'ko_KR');
        const contentEn = getTextByLocale(notice.content, 'en_US');
        const contentTh = getTextByLocale(notice.content, 'th_TH');

        const translations = translationResults[notice.id] || {};

        const translatedNotice: TranslatedNotice = {
          id: notice.id,
          title: {
            ko_KR: titleKo,
            en_US: titleEn,
            th_TH: titleTh,
            zh_TW: translations.title_zh_TW || getTextByLocale(notice.title, 'zh_TW') || titleKo,
          },
          content: {
            ko_KR: contentKo,
            en_US: contentEn,
            th_TH: contentTh,
            zh_TW:
              translations.content_zh_TW || getTextByLocale(notice.content, 'zh_TW') || contentKo,
          },
        };

        existingResults.push(translatedNotice);
      }

      // 진행 상황 업데이트
      progress.processedCount = processedCount + notices.length;
      progress.lastProcessedId = notices[notices.length - 1].id;
      progress.lastUpdateTime = new Date().toISOString();

      // 중간 결과 저장
      saveResults(existingResults);
      saveProgress(progress);

      console.log(
        `✅ ${progress.processedCount}/${totalCount} 완료 (${Math.round((progress.processedCount / totalCount) * 100)}%)`,
      );

      processedCount += BATCH_SIZE;
    }

    console.log('\n🎉 모든 공지사항 중국어 번체 번역 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 공지사항: ${existingResults.length}개`);

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
  translateNoticesToZhTW()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateNoticesToZhTW };
