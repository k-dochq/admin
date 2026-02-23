/**
 * 병원별 리뷰 사진 유무 집계 엑셀 출력
 *
 * - Review / ReviewImage 기준으로, 병원별 "사진 있는 리뷰 수", "사진 없는 리뷰 수", "전체 리뷰 수" 집계
 * - isActive = true인 ReviewImage가 1개 이상인 리뷰를 "사진 있는 리뷰"로 간주
 *
 * 실행:
 *   npx tsx scripts/review-stats/export-review-photo-stats-by-hospital.ts
 *   pnpm run data:review-photo-stats
 *   npx tsx scripts/review-stats/export-review-photo-stats-by-hospital.ts --out ./report.xlsx --limit 20
 */

import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { prisma } from '../../lib/prisma';

type CliOptions = {
  outputPath: string;
  sheetName: string;
  limit: number | null;
};

type StatsRow = {
  hospitalId: string;
  hospitalNameKo: string | null;
  withPhotos: number;
  withoutPhotos: number;
  total: number;
};

const DEFAULT_SHEET_NAME = 'review_photo_stats';

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatTimestampForFileName(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  const defaultOut = path.resolve(
    __dirname,
    '..',
    '..',
    'output',
    `review-photo-stats-by-hospital-${formatTimestampForFileName()}.xlsx`,
  );

  let outputPath = defaultOut;
  let sheetName = DEFAULT_SHEET_NAME;
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

    if (arg === '--limit' && next) {
      const parsed = parsePositiveInt(next);
      if (parsed) limit = parsed;
      i += 1;
      continue;
    }
  }

  return { outputPath, sheetName, limit };
}

const AGGREGATION_SQL = Prisma.sql`
  SELECT
    h.id AS "hospitalId",
    h.name->>'ko_KR' AS "hospitalNameKo",
    COALESCE(stats."withPhotos", 0)::int AS "withPhotos",
    COALESCE(stats."withoutPhotos", 0)::int AS "withoutPhotos",
    COALESCE(stats."total", 0)::int AS "total"
  FROM "Hospital" h
  LEFT JOIN (
    SELECT
      r."hospitalId",
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM "ReviewImage" ri
          WHERE ri."reviewId" = r.id AND ri."isActive" = true
        )
      )::int AS "withPhotos",
      COUNT(*) FILTER (
        WHERE NOT EXISTS (
          SELECT 1 FROM "ReviewImage" ri
          WHERE ri."reviewId" = r.id AND ri."isActive" = true
        )
      )::int AS "withoutPhotos",
      COUNT(*)::int AS "total"
    FROM "Review" r
    WHERE (r."isActive" IS NULL OR r."isActive" = true)
    GROUP BY r."hospitalId"
  ) stats ON stats."hospitalId" = h.id
  ORDER BY "total" DESC, "hospitalNameKo" ASC NULLS LAST
`;

async function fetchStats(limit: number | null): Promise<StatsRow[]> {
  if (limit != null) {
    return prisma.$queryRaw<StatsRow[]>(
      Prisma.sql`${AGGREGATION_SQL} LIMIT ${limit}`,
    );
  }
  return prisma.$queryRaw<StatsRow[]>(AGGREGATION_SQL);
}

async function main(): Promise<void> {
  const options = parseCliOptions();

  console.log('병원별 리뷰 사진 유무 집계 중...');
  if (options.limit != null) {
    console.log(`상위 ${options.limit}개 병원만 출력 (--limit 적용)`);
  }

  const rows = await fetchStats(options.limit);

  const headers = [
    '병원 ID',
    '병원명(한국어)',
    '사진 있는 리뷰 수',
    '사진 없는 리뷰 수',
    '전체 리뷰 수',
  ];

  const excelRows = rows.map((r) => ({
    '병원 ID': r.hospitalId,
    '병원명(한국어)': r.hospitalNameKo ?? '',
    '사진 있는 리뷰 수': r.withPhotos,
    '사진 없는 리뷰 수': r.withoutPhotos,
    '전체 리뷰 수': r.total,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows, { header: [...headers] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName);

  ensureDirForFile(options.outputPath);
  XLSX.writeFile(workbook, options.outputPath);

  console.log('\n엑셀 파일 생성 완료.');
  console.log(
    JSON.stringify(
      {
        ok: true,
        rows: excelRows.length,
        outputPath: options.outputPath,
        sheetName: options.sheetName,
        limit: options.limit,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
