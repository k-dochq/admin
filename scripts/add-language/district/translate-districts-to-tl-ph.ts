import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 결과 파일 경로
const OUTPUT_FILE = path.join(__dirname, 'output/translated-districts-tl-ph.json');
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
  };
  displayName?: {
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
 * tl_PH가 필요한지 확인 (tl_PH가 없거나 비어있는 경우)
 */
function needsTlPHTranslation(localizedText: Prisma.JsonValue): boolean {
  if (!localizedText) return false;
  if (typeof localizedText === 'string') {
    // 문자열인 경우 tl_PH 필요 (ko_KR로 간주)
    return true;
  }

  if (
    typeof localizedText === 'object' &&
    localizedText !== null &&
    !Array.isArray(localizedText)
  ) {
    const text = localizedText as LocalizedText;
    const sourceText = text.en_US; // 영어명이 있어야 함
    const tlPHText = text.tl_PH;

    // 영어명이 있고, tl_PH가 없거나 비어있으면 필요
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
 * 메인 함수 - 영어명을 tl_PH로 복사
 */
async function translateDistrictsToTlPH() {
  try {
    console.log('🌐 지역(District) 필리핀어(tl-PH) 작업 시작...');
    console.log('📝 번역 API 없이 영어명을 그대로 필리핀어로 사용합니다.');

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

    // tl_PH가 필요한 지역만 필터링 (tl_PH가 없거나 비어있는 경우)
    const districtsToProcess = allDistricts.filter((district) => {
      // 이미 처리된 지역은 제외
      if (existingIds.has(district.id)) {
        return false;
      }

      // name, displayName 중 하나라도 tl_PH가 필요하면 포함
      return (
        needsTlPHTranslation(district.name) ||
        (district.displayName && needsTlPHTranslation(district.displayName))
      );
    });

    const totalCount = districtsToProcess.length;
    console.log(
      `📊 총 ${allDistricts.length}개 지역 중 ${totalCount}개 지역이 필리핀어 처리가 필요합니다.`,
    );

    if (totalCount === 0) {
      console.log('✅ 처리가 필요한 지역이 없습니다.');
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

    // 배치 크기 설정
    const BATCH_SIZE = 50; // 번역 API가 없으므로 더 큰 배치 가능

    let processedCount = progress.processedCount;

    while (processedCount < totalCount) {
      console.log(
        `\n📝 처리 중: ${processedCount + 1}-${Math.min(processedCount + BATCH_SIZE, totalCount)}/${totalCount}`,
      );

      // 처리할 지역 배치 가져오기
      const districts = districtsToProcess.slice(processedCount, processedCount + BATCH_SIZE);

      if (districts.length === 0) break;

      // 결과 파일용 데이터 구성
      for (const district of districts) {
        const nameKo = getTextByLocale(district.name, 'ko_KR');
        const nameEn = getTextByLocale(district.name, 'en_US');
        const nameTh = getTextByLocale(district.name, 'th_TH');
        const nameZhTW = getTextByLocale(district.name, 'zh_TW');
        const nameJaJP = getTextByLocale(district.name, 'ja_JP');
        const nameHiIN = getTextByLocale(district.name, 'hi_IN');

        // 영어명을 그대로 tl_PH로 사용
        const nameTlPH = nameEn || nameKo || nameTh || '';

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

          // 영어명을 그대로 tl_PH로 사용
          const displayNameTlPH = displayNameEn || displayNameKo || displayNameTh || '';

          translatedDistrict.displayName = {
            ko_KR: displayNameKo,
            en_US: displayNameEn,
            th_TH: displayNameTh,
            zh_TW: displayNameZhTW,
            ja_JP: displayNameJaJP,
            hi_IN: displayNameHiIN,
            tl_PH: displayNameTlPH,
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

    console.log('\n🎉 모든 지역 필리핀어 처리 완료!');
    console.log(`📁 결과 파일: ${OUTPUT_FILE}`);
    console.log(`📊 총 처리된 지역: ${existingResults.length}개`);

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch (error) {
    console.error('❌ 처리 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  translateDistrictsToTlPH()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { translateDistrictsToTlPH };
