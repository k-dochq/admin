import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// 고정 파일 경로
const EXCEL_FILE = path.join(__dirname, '고민부위.xlsx');
const BACKUP_FILE = path.join(__dirname, '고민부위.backup.xlsx');

// 교체할 텍스트
const SEARCH_TEXT = '턱끝수술';
const REPLACE_TEXT = '턱끝';

/**
 * 안전하게 문자열 추출
 */
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

/**
 * 디렉토리가 없으면 생성
 */
function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 엑셀 파일 읽기
 */
function loadExcelFile(filePath: string): { workbook: XLSX.WorkBook; sheetName: string; rows: Record<string, unknown>[] } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`엑셀 파일을 찾을 수 없습니다: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const availableSheets = workbook.SheetNames;

  if (availableSheets.length === 0) {
    throw new Error(`엑셀 파일에 시트가 없습니다: ${filePath}`);
  }

  // 첫 번째 시트 사용
  const sheetName = availableSheets[0]!;
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`시트를 찾을 수 없습니다: "${sheetName}"`);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    blankrows: false,
  });

  return { workbook, sheetName, rows };
}

/**
 * 행의 모든 컬럼에서 텍스트 교체
 */
function replaceTextInRow(row: Record<string, unknown>): { row: Record<string, unknown>; replacedCount: number } {
  let replacedCount = 0;
  const newRow: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const stringValue = safeString(value);
    
    if (stringValue.includes(SEARCH_TEXT)) {
      const newValue = stringValue.replaceAll(SEARCH_TEXT, REPLACE_TEXT);
      newRow[key] = newValue;
      replacedCount++;
    } else {
      newRow[key] = value;
    }
  }

  return { row: newRow, replacedCount };
}

/**
 * 메인 처리 함수
 */
async function replaceTextInExcel(): Promise<void> {
  try {
    console.log('📖 엑셀 파일 읽기 중...');
    console.log(`파일 경로: ${EXCEL_FILE}`);

    const { workbook, sheetName, rows } = loadExcelFile(EXCEL_FILE);
    console.log(`시트 이름: ${sheetName}`);
    console.log(`총 ${rows.length}개 행 발견`);

    // 백업 파일 생성
    console.log('\n💾 백업 파일 생성 중...');
    ensureDirForFile(BACKUP_FILE);
    fs.copyFileSync(EXCEL_FILE, BACKUP_FILE);
    console.log(`✅ 백업 파일 생성 완료: ${BACKUP_FILE}`);

    // 텍스트 교체 처리
    console.log(`\n🔄 텍스트 교체 처리 중...`);
    console.log(`검색: "${SEARCH_TEXT}" → 교체: "${REPLACE_TEXT}"`);

    const replacedRows: Record<string, unknown>[] = [];
    let totalReplacedCells = 0;
    let rowsWithReplacement = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const { row: newRow, replacedCount } = replaceTextInRow(row);
      replacedRows.push(newRow);

      if (replacedCount > 0) {
        totalReplacedCells += replacedCount;
        rowsWithReplacement++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`  처리 중: ${i + 1}/${rows.length} (교체된 행: ${rowsWithReplacement}개)`);
      }
    }

    console.log(`✅ ${rows.length}개 행 처리 완료`);
    console.log(`📊 교체 통계:`);
    console.log(`  - 교체된 셀: ${totalReplacedCells}개`);
    console.log(`  - 교체가 발생한 행: ${rowsWithReplacement}개`);

    if (totalReplacedCells === 0) {
      console.log('\n⚠️  교체할 텍스트를 찾을 수 없습니다. 파일을 수정하지 않습니다.');
      return;
    }

    // 엑셀 파일로 저장 (원본 파일 덮어쓰기)
    console.log('\n💾 결과 파일 저장 중...');
    const worksheet = XLSX.utils.json_to_sheet(replacedRows);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, sheetName);

    ensureDirForFile(EXCEL_FILE);
    XLSX.writeFile(newWorkbook, EXCEL_FILE);

    console.log(`✅ 결과 파일 저장 완료: ${EXCEL_FILE}`);

    // 최종 통계
    const stats = {
      ok: true,
      excelFile: EXCEL_FILE,
      backupFile: BACKUP_FILE,
      searchText: SEARCH_TEXT,
      replaceText: REPLACE_TEXT,
      totalRows: rows.length,
      replacedCells: totalReplacedCells,
      rowsWithReplacement: rowsWithReplacement,
    };

    console.log('\n📊 최종 통계:');
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('❌ 처리 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  replaceTextInExcel()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { replaceTextInExcel };
