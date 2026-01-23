import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import {
  translateConcerns,
  type ConcernLocale,
  parseConcernTags,
  findConcernMapping,
} from './concerns-mapping';

// 고정 파일 경로
const INPUT_EXCEL_FILE = path.join(__dirname, '고민부위.xlsx');
const OUTPUT_EXCEL_FILE = path.join(__dirname, '고민부위-매핑결과.xlsx');

// 엑셀 컬럼 헤더
const HEADERS = [
  'reviewId',
  '병원명',
  '시술부위 카테고리',
  '고민부위 (한국어)',
  '고민부위 (영어)',
  '고민부위 (태국어)',
  '고민부위 (일본어)',
  '고민부위 (중국어번체)',
  '고민부위 (힌디어)',
  '고민부위 (필리핀어)',
] as const;

type InputRow = {
  reviewId?: string;
  병원명?: string;
  '시술부위 카테고리'?: string;
  '고민부위 (한국어)'?: string;
  '고민부위 (영어)'?: string;
  '고민부위 (태국어)'?: string;
  '고민부위 (일본어)'?: string;
  '고민부위 (중국어번체)'?: string;
  '고민부위 (힌디어)'?: string;
};

type OutputRow = {
  reviewId: string;
  병원명: string;
  '시술부위 카테고리': string;
  '고민부위 (한국어)': string;
  '고민부위 (영어)': string;
  '고민부위 (태국어)': string;
  '고민부위 (일본어)': string;
  '고민부위 (중국어번체)': string;
  '고민부위 (힌디어)': string;
  '고민부위 (필리핀어)': string;
};

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
function loadExcelFile(filePath: string): { sheetName: string; rows: InputRow[] } {
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

  const rows = XLSX.utils.sheet_to_json<InputRow>(worksheet, {
    defval: '',
    blankrows: false,
  });

  return { sheetName, rows };
}

/**
 * 고민부위 매핑 처리
 */
function processConcernsMapping(inputRow: InputRow): OutputRow {
  const koText = safeString(inputRow['고민부위 (한국어)']);

  // 한국어 텍스트가 없으면 빈 문자열 반환
  if (!koText) {
    return {
      reviewId: safeString(inputRow.reviewId),
      병원명: safeString(inputRow.병원명),
      '시술부위 카테고리': safeString(inputRow['시술부위 카테고리']),
      '고민부위 (한국어)': '',
      '고민부위 (영어)': '',
      '고민부위 (태국어)': '',
      '고민부위 (일본어)': '',
      '고민부위 (중국어번체)': '',
      '고민부위 (힌디어)': '',
      '고민부위 (필리핀어)': '',
    };
  }

  // 각 언어로 변환
  const enText = translateConcerns(koText, 'en_US');
  const thText = translateConcerns(koText, 'th_TH');
  const jaText = translateConcerns(koText, 'ja_JP');
  const zhText = translateConcerns(koText, 'zh_TW');
  const hiText = translateConcerns(koText, 'hi_IN');
  const tlText = translateConcerns(koText, 'tl_PH');

  return {
    reviewId: safeString(inputRow.reviewId),
    병원명: safeString(inputRow.병원명),
    '시술부위 카테고리': safeString(inputRow['시술부위 카테고리']),
    '고민부위 (한국어)': koText,
    '고민부위 (영어)': enText,
    '고민부위 (태국어)': thText,
    '고민부위 (일본어)': jaText,
    '고민부위 (중국어번체)': zhText,
    '고민부위 (힌디어)': hiText,
    '고민부위 (필리핀어)': tlText,
  };
}

/**
 * 매핑되지 않은 태그 통계 수집
 */
function collectUnmappedTags(rows: InputRow[]): Map<string, number> {
  const unmappedTags = new Map<string, number>();

  for (const row of rows) {
    const koText = safeString(row['고민부위 (한국어)']);
    if (!koText) continue;

    const tags = parseConcernTags(koText);
    for (const tag of tags) {
      const mapping = findConcernMapping(tag);
      if (!mapping) {
        const count = unmappedTags.get(tag) || 0;
        unmappedTags.set(tag, count + 1);
      }
    }
  }

  return unmappedTags;
}

/**
 * 메인 처리 함수
 */
async function mapConcernsFromExcel(): Promise<void> {
  try {
    console.log('📖 엑셀 파일 읽기 중...');
    console.log(`입력 파일: ${INPUT_EXCEL_FILE}`);

    const { sheetName, rows: inputRows } = loadExcelFile(INPUT_EXCEL_FILE);
    console.log(`시트 이름: ${sheetName}`);
    console.log(`총 ${inputRows.length}개 행 발견`);

    console.log('\n🔄 고민부위 매핑 처리 중...');
    const outputRows: OutputRow[] = [];
    let processedCount = 0;

    for (let i = 0; i < inputRows.length; i++) {
      const inputRow = inputRows[i];
      const outputRow = processConcernsMapping(inputRow);
      outputRows.push(outputRow);

      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`  처리 중: ${processedCount}/${inputRows.length}`);
      }
    }

    console.log(`✅ ${processedCount}개 행 처리 완료`);

    // 매핑되지 않은 태그 통계
    console.log('\n📊 매핑되지 않은 태그 확인 중...');
    const unmappedTags = collectUnmappedTags(inputRows);
    if (unmappedTags.size > 0) {
      console.log(`⚠️  매핑되지 않은 태그 ${unmappedTags.size}개 발견:`);
      const sortedUnmapped = Array.from(unmappedTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // 상위 20개만 출력
      for (const [tag, count] of sortedUnmapped) {
        console.log(`  - ${tag}: ${count}회`);
      }
      if (unmappedTags.size > 20) {
        console.log(`  ... 외 ${unmappedTags.size - 20}개`);
      }
    } else {
      console.log('✅ 모든 태그가 매핑되었습니다.');
    }

    // 엑셀 파일로 저장
    console.log('\n💾 결과 파일 저장 중...');
    const worksheet = XLSX.utils.json_to_sheet(outputRows, { header: [...HEADERS] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    ensureDirForFile(OUTPUT_EXCEL_FILE);
    XLSX.writeFile(workbook, OUTPUT_EXCEL_FILE);

    console.log(`✅ 결과 파일 저장 완료: ${OUTPUT_EXCEL_FILE}`);

    // 최종 통계
    const stats = {
      ok: true,
      inputFile: INPUT_EXCEL_FILE,
      outputFile: OUTPUT_EXCEL_FILE,
      totalRows: inputRows.length,
      processedRows: outputRows.length,
      unmappedTagsCount: unmappedTags.size,
      unmappedTags: Array.from(unmappedTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count })),
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
  mapConcernsFromExcel()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { mapConcernsFromExcel };
