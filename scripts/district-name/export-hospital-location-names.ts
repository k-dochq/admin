/**
 * 병원 표시지역명 엑셀 출력 스크립트
 *
 * 병원 데이터를 조회하여 병원 ID, 병원명(한국어), 표시지역명(각 언어별)을 엑셀 파일로 출력합니다.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { prisma } from '../../lib/prisma';
import { getKoreanText, getLocalizedText } from './utils';
import type { Locale } from './types';

type CliOptions = {
  outputPath: string;
  sheetName: string;
  batchSize: number;
  limit: number | null;
};

const DEFAULT_SHEET_NAME = 'hospital_location_names';
const DEFAULT_BATCH_SIZE = 500;

// 지원하는 모든 언어 목록
const ALL_LOCALES: Locale[] = ['ko_KR', 'en_US', 'th_TH', 'ja_JP', 'zh_TW', 'hi_IN', 'tl_PH'];

/**
 * 파일 경로의 디렉토리가 없으면 생성
 */
function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 타임스탬프를 파일명 형식으로 포맷
 */
function formatTimestampForFileName(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

/**
 * 양수 정수 파싱
 */
function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

/**
 * CLI 옵션 파싱
 */
function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  const defaultOut = path.resolve(
    __dirname,
    '..',
    '..',
    'output',
    `hospital-location-names-${formatTimestampForFileName()}.xlsx`,
  );

  let outputPath = defaultOut;
  let sheetName = DEFAULT_SHEET_NAME;
  let batchSize = DEFAULT_BATCH_SIZE;
  let limit: number | null = null;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--out' && next) {
      outputPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--sheet' && next) {
      sheetName = next;
      i += 1;
      continue;
    }

    if (arg === '--batch' && next) {
      const parsed = parsePositiveInt(next);
      if (parsed) batchSize = parsed;
      i += 1;
      continue;
    }

    if (arg === '--limit' && next) {
      const parsed = parsePositiveInt(next);
      limit = parsed ?? null;
      i += 1;
      continue;
    }
  }

  return { outputPath, sheetName, batchSize, limit };
}

/**
 * 병원 데이터 조회
 */
async function fetchHospitals(options: {
  limit?: number | null;
  batchSize: number;
  cursorId?: string | null;
}): Promise<
  Array<{
    id: string;
    name: unknown;
    displayLocationName: unknown;
  }>
> {
  const { limit, batchSize, cursorId } = options;

  const take = limit ? Math.min(batchSize, limit) : batchSize;

  const hospitals = await prisma.hospital.findMany({
    select: {
      id: true,
      name: true,
      displayLocationName: true,
    },
    orderBy: { id: 'asc' },
    take,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
  });

  return hospitals;
}

/**
 * 엑셀 헤더 정의
 */
function getHeaders(): string[] {
  return [
    '병원ID',
    '병원명(한국어)',
    '표시지역명(한국어)',
    '표시지역명(영어)',
    '표시지역명(태국어)',
    '표시지역명(중국어번체)',
    '표시지역명(일본어)',
    '표시지역명(힌디어)',
    '표시지역명(필리핀어)',
  ];
}

/**
 * 병원 데이터를 엑셀 행 데이터로 변환
 */
function convertHospitalToRow(hospital: {
  id: string;
  name: unknown;
  displayLocationName: unknown;
}): Record<string, string> {
  const hospitalKoreanName = getKoreanText(hospital.name);
  const locationKoreanName = getLocalizedText(hospital.displayLocationName, 'ko_KR');
  const locationEnglish = getLocalizedText(hospital.displayLocationName, 'en_US');
  const locationThai = getLocalizedText(hospital.displayLocationName, 'th_TH');
  const locationChinese = getLocalizedText(hospital.displayLocationName, 'zh_TW');
  const locationJapanese = getLocalizedText(hospital.displayLocationName, 'ja_JP');
  const locationHindi = getLocalizedText(hospital.displayLocationName, 'hi_IN');
  const locationFilipino = getLocalizedText(hospital.displayLocationName, 'tl_PH');

  const headers = getHeaders();
  return {
    [headers[0]]: hospital.id,
    [headers[1]]: hospitalKoreanName,
    [headers[2]]: locationKoreanName,
    [headers[3]]: locationEnglish,
    [headers[4]]: locationThai,
    [headers[5]]: locationChinese,
    [headers[6]]: locationJapanese,
    [headers[7]]: locationHindi,
    [headers[8]]: locationFilipino,
  };
}

/**
 * 메인 엑셀 출력 함수
 */
async function exportHospitalLocationNames(): Promise<void> {
  try {
    console.log('🔄 병원 표시지역명 엑셀 출력 작업 시작...\n');

    const { outputPath, sheetName, batchSize, limit } = parseCliOptions();

    console.log('📋 실행 옵션:');
    console.log(JSON.stringify({ outputPath, sheetName, batchSize, limit }, null, 2));
    console.log('');

    const headers = getHeaders();
    const rows: Array<Record<string, string>> = [];

    let cursorId: string | undefined;
    let fetchedTotal = 0;

    // 전체 병원 수 조회
    const totalCount = await prisma.hospital.count();
    console.log(`📊 전체 병원 수: ${totalCount}개\n`);

    // DB 부하 방지:
    // - 필요한 컬럼만 select
    // - skip 대신 cursor 기반 페이징
    // - 배치 크기 제한
    while (true) {
      const remaining = limit ? limit - fetchedTotal : null;
      if (remaining !== null && remaining <= 0) break;

      const batch = await fetchHospitals({
        limit: remaining || null,
        batchSize,
        cursorId,
      });

      if (batch.length === 0) break;

      for (const hospital of batch) {
        rows.push(convertHospitalToRow(hospital));
      }

      fetchedTotal += batch.length;
      cursorId = batch[batch.length - 1].id;

      console.log(
        JSON.stringify(
          {
            step: 'progress',
            fetched: fetchedTotal,
            lastId: cursorId,
            batchSize: batch.length,
            limit,
          },
          null,
          2,
        ),
      );

      // 매우 짧은 쉬어가기(과도한 연속 쿼리 방지)
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // 엑셀 파일 생성
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...headers] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    ensureDirForFile(outputPath);
    XLSX.writeFile(workbook, outputPath);

    console.log('\n🎉 엑셀 파일 생성 완료!');
    console.log(
      JSON.stringify(
        {
          ok: true,
          rows: rows.length,
          outputPath,
          sheetName,
          batchSize,
          limit,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error('❌ 엑셀 출력 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  exportHospitalLocationNames()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { exportHospitalLocationNames };
