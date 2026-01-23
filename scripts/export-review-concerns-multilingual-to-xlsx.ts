import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';

type CliOptions = {
  outputPath: string;
  sheetName: string;
  batchSize: number;
  limit: number | null;
  onlyActive: boolean;
};

type ConcernsMultilingual = Partial<
  Record<'ko_KR' | 'en_US' | 'th_TH' | 'ja_JP' | 'zh_TW' | 'hi_IN', string>
>;

type LocalizedJson = Record<string, unknown>;

const DEFAULT_SHEET_NAME = 'review_concerns';
const DEFAULT_BATCH_SIZE = 500;

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
    'output',
    `review-concerns-multilingual-${formatTimestampForFileName()}.xlsx`,
  );

  let outputPath = defaultOut;
  let sheetName = DEFAULT_SHEET_NAME;
  let batchSize = DEFAULT_BATCH_SIZE;
  let limit: number | null = null;
  let onlyActive = false; // 기본: 전체(요청에 명시 없음)

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

    if (arg === '--only-active') {
      onlyActive = true;
      continue;
    }
  }

  return { outputPath, sheetName, batchSize, limit, onlyActive };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getKoreanTextFromJson(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return '';

  const v = value as LocalizedJson;
  const candidateKeys = ['ko_KR', 'ko'] as const;

  for (const key of candidateKeys) {
    const out = v[key];
    if (typeof out === 'string' && out.trim()) return out.trim();
  }

  return '';
}

function coerceConcernsMultilingual(value: unknown): ConcernsMultilingual | null {
  if (!isRecord(value)) return null;

  const locales = ['ko_KR', 'en_US', 'th_TH', 'ja_JP', 'zh_TW', 'hi_IN'] as const;
  const out: ConcernsMultilingual = {};

  for (const locale of locales) {
    const v = value[locale];
    if (typeof v === 'string') out[locale] = v;
  }

  return out;
}

function getConcernText(params: {
  concerns?: string | null;
  concernsMultilingual?: unknown;
  locale: keyof ConcernsMultilingual;
}): string {
  const multilingual = coerceConcernsMultilingual(params.concernsMultilingual);
  const fromJson = multilingual?.[params.locale];
  if (typeof fromJson === 'string' && fromJson.trim()) return fromJson.trim();

  // fallback: legacy `concerns`는 일반적으로 한국어 원문일 가능성이 높음
  if (params.locale === 'ko_KR' && params.concerns && params.concerns.trim()) {
    return params.concerns.trim();
  }

  return '';
}

async function exportReviewConcernsMultilingualToXlsx(): Promise<void> {
  const { outputPath, sheetName, batchSize, limit, onlyActive } = parseCliOptions();

  const headers = [
    'reviewId',
    '병원명',
    '시술부위 카테고리',
    '고민부위 (한국어)',
    '고민부위 (영어)',
    '고민부위 (태국어)',
    '고민부위 (일본어)',
    '고민부위 (중국어번체)',
    '고민부위 (힌디어)',
  ] as const;

  const rows: Array<Record<(typeof headers)[number], string>> = [];

  let cursorId: string | undefined;
  let fetchedTotal = 0;

  // DB 부하 방지:
  // - 필요한 컬럼만 select
  // - skip 대신 cursor 기반 페이징
  // - 배치 크기 제한
  while (true) {
    const take = limit ? Math.min(batchSize, Math.max(limit - fetchedTotal, 0)) : batchSize;
    if (take <= 0) break;

    const batch = await prisma.review.findMany({
      select: {
        id: true,
        concerns: true,
        concernsMultilingual: true,
        isActive: true,
        hospital: {
          select: {
            name: true,
          },
        },
        medicalSpecialty: {
          select: {
            name: true,
          },
        },
      },
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { id: 'asc' },
      take,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
    });

    if (batch.length === 0) break;

    for (const review of batch) {
      rows.push({
        reviewId: review.id,
        병원명: getKoreanTextFromJson(review.hospital?.name),
        '시술부위 카테고리': getKoreanTextFromJson(review.medicalSpecialty?.name),
        '고민부위 (한국어)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'ko_KR',
        }),
        '고민부위 (영어)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'en_US',
        }),
        '고민부위 (태국어)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'th_TH',
        }),
        '고민부위 (일본어)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'ja_JP',
        }),
        '고민부위 (중국어번체)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'zh_TW',
        }),
        '고민부위 (힌디어)': getConcernText({
          concerns: review.concerns,
          concernsMultilingual: review.concernsMultilingual,
          locale: 'hi_IN',
        }),
      });
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
          onlyActive,
          limit,
        },
        null,
        2,
      ),
    );

    // 매우 짧은 쉬어가기(과도한 연속 쿼리 방지)
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...headers] });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  ensureDirForFile(outputPath);
  XLSX.writeFile(workbook, outputPath);

  console.log(
    JSON.stringify(
      {
        ok: true,
        rows: rows.length,
        outputPath,
        sheetName,
        batchSize,
        onlyActive,
        limit,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  exportReviewConcernsMultilingualToXlsx()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect().catch(() => undefined);
    });
}

export { exportReviewConcernsMultilingualToXlsx };

