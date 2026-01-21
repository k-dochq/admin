import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const EXCEL_FILE_NAME = '병원 운영관련 통합 관리.xlsx';
const SHEET_NAME = '리뷰 전체 모음 시트';
const DEFAULT_START_ROW = 1678;

type CliOptions = {
  excelPath: string;
  sheetName: string;
  startRow: number;
  limit?: number;
  outPath: string;
};

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let excelPath = path.resolve(__dirname, 'data', EXCEL_FILE_NAME);
  let sheetName = SHEET_NAME;
  // 1행은 헤더로 가정, 2행부터 데이터. 기본값은 요청사항에 따라 1678행부터.
  let startRow = DEFAULT_START_ROW;
  let limit: number | undefined;
  let outPath = path.resolve(__dirname, 'output', `review-sheet-from-row-${startRow}.json`);

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--file' && next) {
      excelPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (arg === '--sheet' && next) {
      sheetName = next;
      i += 1;
      continue;
    }

    if (arg === '--startRow' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--startRow 값이 올바르지 않습니다: ${next}`);
      }
      startRow = Math.floor(parsed);
      outPath = path.resolve(__dirname, 'output', `review-sheet-from-row-${startRow}.json`);
      i += 1;
      continue;
    }

    if (arg === '--limit' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`--limit 값이 올바르지 않습니다: ${next}`);
      }
      limit = Math.floor(parsed);
      i += 1;
      continue;
    }

    if (arg === '--out' && next) {
      outPath = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }
  }

  return { excelPath, sheetName, startRow, limit, outPath };
}

function loadRowsFromSheet(filePath: string, sheetName: string): unknown[] {
  const workbook = XLSX.readFile(filePath, { cellDates: true });

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    const availableSheets = workbook.SheetNames.join(', ');
    throw new Error(
      `시트를 찾을 수 없습니다: "${sheetName}". 사용 가능한 시트: [${availableSheets}]`,
    );
  }

  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    blankrows: true,
  });
}

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function printReviewSheet(): Promise<void> {
  const { excelPath, sheetName, startRow, limit, outPath } = parseCliOptions();
  const allRows = loadRowsFromSheet(excelPath, sheetName);
  // sheet_to_json() 결과는 1행(헤더)을 제외한 데이터 행 배열이라고 가정합니다.
  // 따라서 엑셀의 N행부터 시작하려면 (N - 2)개의 데이터를 스킵하면 됩니다.
  const startIndex = Math.max(0, startRow - 2);
  const fromRows = allRows.slice(startIndex);
  const rows = typeof limit === 'number' ? fromRows.slice(0, limit) : fromRows;

  ensureDirForFile(outPath);
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        sheetName,
        startRow,
        writtenRows: rows.length,
        outPath,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  printReviewSheet()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

export { printReviewSheet };

