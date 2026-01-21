import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

type Row = Record<string, unknown>;

type CliOptions = {
  inputPath: string;
  outputPath: string;
  sheetName: string;
};

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids.json',
);

const DEFAULT_OUTPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids.xlsx',
);

const DEFAULT_SHEET_NAME = 'reviews';

const PREFERRED_HEADERS = [
  '기존 아이디',
  '병원',
  '리뷰 시트 이름',
  '시술부위',
  '고민부위',
  '별점',
  '시술시기',
  '후기 내용',
  '문맥변경',
  '문맥변경_en_US',
  '문맥변경_th_TH',
  '문맥변경_zh_TW',
  '문맥변경_ja_JP',
  '문맥변경_hi_IN',
  'reviewId',
  'reviewMatchStatus',
  '사용자 아이디(@example)',
  '변경된 아이디',
  '기타메모',
  '생생후기 작업',
] as const;

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let inputPath = DEFAULT_INPUT_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;
  let sheetName = DEFAULT_SHEET_NAME;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--in' && next) {
      inputPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

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
  }

  return { inputPath, outputPath, sheetName };
}

function normalizeCellValue(value: unknown): string | number | boolean | Date {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value;
  if (value instanceof Date) return value;

  // 객체/배열은 JSON 문자열로
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function collectHeaders(rows: Row[]): string[] {
  const set = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      set.add(key);
    }
  }

  const preferred = PREFERRED_HEADERS.filter((h) => set.has(h));
  for (const h of preferred) set.delete(h);

  const rest = Array.from(set).sort((a, b) => a.localeCompare(b));
  return [...preferred, ...rest];
}

async function exportReviewJsonToXlsx(): Promise<void> {
  const { inputPath, outputPath, sheetName } = parseCliOptions();

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('입력 JSON 형식이 올바르지 않습니다. (배열이 아닙니다)');
  }

  const rows = parsed as Row[];
  const headers = collectHeaders(rows);

  const sheetRows: Record<string, string | number | boolean | Date>[] = rows.map((row) => {
    const out: Record<string, string | number | boolean | Date> = {};
    for (const header of headers) {
      out[header] = normalizeCellValue(row[header]);
    }
    return out;
  });

  const worksheet = XLSX.utils.json_to_sheet(sheetRows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  ensureDirForFile(outputPath);
  XLSX.writeFile(workbook, outputPath);

  console.log(
    JSON.stringify(
      {
        ok: true,
        inputPath,
        rows: rows.length,
        headers: headers.length,
        outputPath,
        sheetName,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  exportReviewJsonToXlsx()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

export { exportReviewJsonToXlsx };

