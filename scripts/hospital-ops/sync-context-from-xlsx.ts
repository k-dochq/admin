import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

type Row = Record<string, unknown>;

type CliOptions = {
  jsonPath: string;
  xlsxPath: string;
  sheetName?: string;
  outPath: string;
  reportPath: string;
  dryRun: boolean;
};

const DEFAULT_JSON_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids.json',
);

const DEFAULT_XLSX_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids-v2.xlsx',
);

const DEFAULT_SHEET_NAME = 'reviews';
const CONTEXT_KEY = '문맥변경';
const REVIEW_ID_KEY = 'reviewId';

function timestampForFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function atomicWriteJson(filePath: string, data: unknown): void {
  ensureDirForFile(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmpPath = path.join(dir, `.${base}.tmp`);

  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

function safeString(v: unknown): string {
  return String(v ?? '').trim();
}

function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

function normalizeForCompare(s: string): string {
  return normalizeLineEndings(s).trim();
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let jsonPath = DEFAULT_JSON_PATH;
  let xlsxPath = DEFAULT_XLSX_PATH;
  let sheetName: string | undefined = DEFAULT_SHEET_NAME;
  let outPath = DEFAULT_JSON_PATH; // 기본은 덮어쓰기
  let reportPath = path.resolve(
    __dirname,
    'output',
    `review-sheet-from-row-1678.filtered.with-review-ids.context-sync-report.json`,
  );
  let dryRun = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--json' && next) {
      jsonPath = path.resolve(process.cwd(), next);
      outPath = jsonPath; // 입력을 바꾸면 기본 출력도 따라가도록
      i += 1;
      continue;
    }

    if (arg === '--xlsx' && next) {
      xlsxPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--sheet' && next) {
      sheetName = next;
      i += 1;
      continue;
    }

    if (arg === '--out' && next) {
      outPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--report' && next) {
      reportPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--no-sheet') {
      sheetName = undefined;
      continue;
    }

    if (arg === '--dryRun' || arg === '--dry-run') {
      dryRun = true;
      continue;
    }
  }

  return { jsonPath, xlsxPath, sheetName, outPath, reportPath, dryRun };
}

function readJsonArray(filePath: string): Row[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`입력 JSON 형식이 올바르지 않습니다(배열 아님): ${filePath}`);
  }
  return parsed as Row[];
}

function loadSheetRows({
  xlsxPath,
  sheetName,
}: {
  xlsxPath: string;
  sheetName?: string;
}): { usedSheetName: string; rows: Row[]; availableSheets: string[] } {
  const workbook = XLSX.readFile(xlsxPath, { cellDates: true });
  const availableSheets = workbook.SheetNames;

  let usedSheetName = sheetName ?? availableSheets[0] ?? '';
  if (!usedSheetName) throw new Error(`엑셀 시트를 찾을 수 없습니다: ${xlsxPath}`);

  if (!workbook.Sheets[usedSheetName]) {
    if (sheetName) {
      throw new Error(
        `시트를 찾을 수 없습니다: "${sheetName}". 사용 가능한 시트: [${availableSheets.join(', ')}]`,
      );
    }
    // sheetName 미지정(--no-sheet) + 0번째도 없으면 위에서 throw
    usedSheetName = availableSheets[0]!;
  }

  const worksheet = workbook.Sheets[usedSheetName];
  if (!worksheet) {
    throw new Error(
      `시트를 찾을 수 없습니다: "${usedSheetName}". 사용 가능한 시트: [${availableSheets.join(', ')}]`,
    );
  }

  const rows = XLSX.utils.sheet_to_json<Row>(worksheet, {
    defval: '',
    blankrows: false,
  });

  return { usedSheetName, rows, availableSheets };
}

function buildXlsxContextMap(xlsxRows: Row[]): {
  map: Map<string, { context: string; rowIndex: number }>;
  duplicates: Array<{ reviewId: string; rowIndexes: number[] }>;
  missingReviewIdCount: number;
} {
  const map = new Map<string, { context: string; rowIndex: number }>();
  const dupTemp = new Map<string, number[]>();
  let missingReviewIdCount = 0;

  for (let i = 0; i < xlsxRows.length; i += 1) {
    const row = xlsxRows[i];
    const reviewId = safeString(row[REVIEW_ID_KEY]);
    if (!reviewId) {
      missingReviewIdCount += 1;
      continue;
    }

    const contextRaw = safeString(row[CONTEXT_KEY]);
    const context = normalizeLineEndings(contextRaw);

    if (!map.has(reviewId)) {
      map.set(reviewId, { context, rowIndex: i });
    } else {
      const existing = dupTemp.get(reviewId) ?? [];
      if (existing.length === 0) {
        existing.push(map.get(reviewId)!.rowIndex);
      }
      existing.push(i);
      dupTemp.set(reviewId, existing);
      // 첫 번째를 우선으로 유지합니다.
    }
  }

  const duplicates = Array.from(dupTemp.entries()).map(([reviewId, rowIndexes]) => ({
    reviewId,
    rowIndexes,
  }));

  return { map, duplicates, missingReviewIdCount };
}

async function syncContextFromXlsx(): Promise<void> {
  const { jsonPath, xlsxPath, sheetName, outPath, reportPath, dryRun } = parseCliOptions();

  if (!fs.existsSync(jsonPath)) throw new Error(`JSON 파일을 찾을 수 없습니다: ${jsonPath}`);
  if (!fs.existsSync(xlsxPath)) throw new Error(`XLSX 파일을 찾을 수 없습니다: ${xlsxPath}`);

  const jsonRows = readJsonArray(jsonPath);
  const { usedSheetName, rows: xlsxRows, availableSheets } = loadSheetRows({ xlsxPath, sheetName });

  const { map: xlsxByReviewId, duplicates, missingReviewIdCount: xlsxMissingReviewIdCount } =
    buildXlsxContextMap(xlsxRows);

  let jsonMissingReviewIdCount = 0;
  let missingInXlsxCount = 0;
  let matchedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  const updatedReviewIds: string[] = [];

  for (let i = 0; i < jsonRows.length; i += 1) {
    const row = jsonRows[i];
    const reviewId = safeString(row[REVIEW_ID_KEY]);
    if (!reviewId) {
      jsonMissingReviewIdCount += 1;
      continue;
    }

    const xlsxMatch = xlsxByReviewId.get(reviewId);
    if (!xlsxMatch) {
      missingInXlsxCount += 1;
      continue;
    }

    matchedCount += 1;

    const current = normalizeLineEndings(safeString(row[CONTEXT_KEY]));
    const next = xlsxMatch.context;

    if (normalizeForCompare(current) !== normalizeForCompare(next)) {
      updatedCount += 1;
      updatedReviewIds.push(reviewId);
      if (!dryRun) row[CONTEXT_KEY] = next;
    } else {
      unchangedCount += 1;
    }
  }

  const isOverwrite = path.resolve(jsonPath) === path.resolve(outPath);
  const backupPath =
    !dryRun && isOverwrite
      ? (() => {
          const { dir, name, ext } = path.parse(jsonPath);
          const bp = path.join(dir, `${name}.bak-${timestampForFilename()}${ext || '.json'}`);
          fs.copyFileSync(jsonPath, bp);
          return bp;
        })()
      : null;

  if (!dryRun) {
    atomicWriteJson(outPath, jsonRows);
  }

  const report = {
    ok: true,
    dryRun,
    jsonPath,
    outPath,
    backupPath,
    xlsxPath,
    sheetNameRequested: sheetName ?? null,
    sheetNameUsed: usedSheetName,
    availableSheets,
    totalJsonRows: jsonRows.length,
    totalXlsxRows: xlsxRows.length,
    matchedByReviewId: matchedCount,
    updatedCount,
    unchangedCount,
    jsonMissingReviewIdCount,
    xlsxMissingReviewIdCount,
    missingInXlsxCount,
    xlsxDuplicateReviewIdCount: duplicates.length,
    xlsxDuplicateReviewIds: duplicates.map((d) => d.reviewId),
    updatedReviewIds,
  };

  atomicWriteJson(reportPath, report);
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  syncContextFromXlsx()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

export { syncContextFromXlsx };

