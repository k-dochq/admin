import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 사용자 언어 통계를 생성하고 CSV 파일로 출력하는 스크립트
 *
 * - User 테이블의 locale 필드를 분석
 * - 한국어(ko_KR)는 영어(en_US)로 간주하여 통계 계산
 * - 요약 통계와 상세 데이터를 CSV 파일로 생성
 */

// 언어 이름 매핑
const LANGUAGE_NAMES: Record<string, string> = {
  en_US: 'English',
  th_TH: 'Thai',
  ko_KR: 'Korean',
};

/**
 * locale을 매핑된 언어로 변환 (한국어는 영어로 간주)
 */
function mapLocale(locale: string | null): string {
  if (!locale) return 'Unknown';
  // 한국어는 영어로 매핑
  if (locale === 'ko_KR') return 'en_US';
  return locale;
}

/**
 * locale 코드를 언어 이름으로 변환
 */
function getLanguageName(localeCode: string): string {
  const mappedLocale = mapLocale(localeCode);
  return LANGUAGE_NAMES[mappedLocale] || mappedLocale;
}

/**
 * CSV 행을 이스케이프 처리
 */
function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 이중화
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * 사용자 언어 통계 생성
 */
async function generateUserLanguageStatistics() {
  console.log('🔍 사용자 언어 통계 생성 시작...\n');

  try {
    // 1. 모든 사용자의 id와 locale 조회
    console.log('📊 사용자 데이터 조회 중...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        locale: true,
      },
    });

    console.log(`✅ 총 ${users.length}명의 사용자 데이터를 조회했습니다.\n`);

    // 2. 언어별 통계 계산
    const languageStats = new Map<string, { count: number; localeCode: string }>();
    const detailedData: Array<{
      userId: string;
      originalLocale: string | null;
      mappedLanguage: string;
      localeCode: string;
    }> = [];

    for (const user of users) {
      const originalLocale = user.locale;
      const mappedLocale = mapLocale(originalLocale);
      const languageName = getLanguageName(mappedLocale);

      // 상세 데이터 추가
      detailedData.push({
        userId: user.id,
        originalLocale: originalLocale,
        mappedLanguage: languageName,
        localeCode: mappedLocale,
      });

      // 통계 집계
      const current = languageStats.get(mappedLocale) || { count: 0, localeCode: mappedLocale };
      current.count++;
      languageStats.set(mappedLocale, current);
    }

    // 3. 통계를 배열로 변환하고 정렬
    const statsArray = Array.from(languageStats.entries())
      .map(([localeCode, data]) => ({
        language: getLanguageName(localeCode),
        localeCode,
        userCount: data.count,
        percentage: ((data.count / users.length) * 100).toFixed(2),
      }))
      .sort((a, b) => b.userCount - a.userCount);

    // 4. 콘솔에 통계 출력
    console.log('📈 언어별 사용자 통계:');
    console.log('─'.repeat(60));
    console.log(
      `${'언어'.padEnd(15)} ${'Locale 코드'.padEnd(15)} ${'사용자 수'.padEnd(10)} ${'비율'.padEnd(10)}`,
    );
    console.log('─'.repeat(60));
    for (const stat of statsArray) {
      console.log(
        `${stat.language.padEnd(15)} ${stat.localeCode.padEnd(15)} ${String(stat.userCount).padEnd(10)} ${stat.percentage.padEnd(10)}%`,
      );
    }
    console.log('─'.repeat(60));
    console.log(`총 사용자 수: ${users.length}명\n`);

    // 5. CSV 파일 생성
    const outputDir = path.join(__dirname, '..');
    const summaryCsvPath = path.join(outputDir, 'user-language-statistics-summary.csv');
    const detailedCsvPath = path.join(outputDir, 'user-language-statistics-detailed.csv');

    // 요약 통계 CSV 생성
    console.log('📝 요약 통계 CSV 파일 생성 중...');
    const summaryCsvRows: string[] = [];
    summaryCsvRows.push('language,locale_code,user_count,percentage');
    for (const stat of statsArray) {
      summaryCsvRows.push(
        `${escapeCsvValue(stat.language)},${escapeCsvValue(stat.localeCode)},${escapeCsvValue(String(stat.userCount))},${escapeCsvValue(stat.percentage)}`,
      );
    }
    fs.writeFileSync(summaryCsvPath, summaryCsvRows.join('\n'), 'utf-8');
    console.log(`✅ 요약 통계 CSV 파일 생성 완료: ${summaryCsvPath}`);

    // 상세 데이터 CSV 생성
    console.log('📝 상세 데이터 CSV 파일 생성 중...');
    const detailedCsvRows: string[] = [];
    detailedCsvRows.push('user_id,original_locale,mapped_language,locale_code');
    for (const data of detailedData) {
      detailedCsvRows.push(
        `${escapeCsvValue(data.userId)},${escapeCsvValue(data.originalLocale)},${escapeCsvValue(data.mappedLanguage)},${escapeCsvValue(data.localeCode)}`,
      );
    }
    fs.writeFileSync(detailedCsvPath, detailedCsvRows.join('\n'), 'utf-8');
    console.log(`✅ 상세 데이터 CSV 파일 생성 완료: ${detailedCsvPath}`);

    console.log('\n🎉 사용자 언어 통계 생성이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 데이터베이스 연결 종료');
  }
}

/**
 * 메인 함수
 */
async function main() {
  try {
    await generateUserLanguageStatistics();
  } catch (error) {
    console.error('💥 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { generateUserLanguageStatistics };
