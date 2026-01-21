import * as fs from 'fs';
import * as path from 'path';

type Row = Record<string, unknown>;

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.json',
);

const DEFAULT_OUTPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.json',
);

const TARGET_EXISTING_IDS = [
  '쿼카YB8aJ',
  '영구야2',
  '냥이YjTdF',
  '여우vTd6K',
  '뚜루라리롱',
  '여우F5Utc',
  '마라라12',
  'chdl10',
  'hr_',
  '강강수월랭',
  '아이폰성애자',
  '뽕야뽕야',
  'maay',
  '보리뇨',
  '이로리',
  '보라돌이좋아요',
  '킹빵댕',
  '율희H11',
  '플라워츄',
  '닭고야',
  '초코민투',
  '여우h1x0P',
  'll25il',
  '잉뚜뽀',
  '바이올렛냠',
  'Judy216',
  '무니7',
  '토끼v0nR4',
  '다램g',
  '토끼N5es1',
  '나는나임큭',
  '냥이jBlZA',
  '냥이fuDSd',
  '토끼OasH6',
  '냥이QUlZb',
  '쿼카8GoL5',
  '우동통이',
  '빈진호',
  '헤이이즐',
  '모찌쥬앙',
  '사시니10',
  '뭉라',
  '이리이리이느',
  'unni8Q7hUk',
  'unniY68Pue',
  '안ㅡ',
  '오리92',
  'unni8spUTS',
  'unniLiBZp5',
  'unni7qllOM',
  'unniZfNM7s',
  '새공이',
  'unni5U5yWi',
  'unniHs99MK',
  'unniMVHcbU',
  'unniKuVQcw',
  'unniXzQj4T',
  '니가안함내가하고',
  'unni2vNokC',
  'unniAZge3J',
  '허거덩거덩',
  'unniSfLcA9',
  '영라',
  '리미리미다',
  'ㅎㅇㅎㄹㅎㅇㄹ',
  '츄로스맨',
  'Ss3',
  '얼큰이라',
  '배고파짜증나게',
  'syjw__',
  '연서니',
  '복치메라',
  'Mayley',
  '떡뽂이떡',
  '백로하',
  'siraume',
  'daw99',
  '오예린님',
  'viiviii',
  '가능하다고륭',
  '호호쇼쇼롷',
  'wjdtnr2',
  'wdfwf31',
  'm5tzzt',
  '웅냥훙냥냥',
  '갱쥐3z4dA',
  '토끼lIW6e',
  'duddms9',
  '쁘띠츄츄츄',
  'Jooyoungh',
  '장군대머리',
  '5호라',
  'unniKSw6nX',
  'unniKgo8K2',
  'alien7809',
  'unniIjSNKZ',
  'nang0',
  '구2c루피',
  'hukkfsd',
  'unniZDbToj',
  '김이둥둥둥',
  '하느니',
  'unni9x6Uog',
  'iiuu',
  '묨뇸이',
  'ㅎㅎㅎㅋㅋㄱㄱ',
  '비타민J',
  '시술에미친자',
  'Ekl96',
  '슐리율리',
  '냥이MApRJ',
  '쿼카Ot5av',
  '냥이qFUNV',
  '아뇽뚱인데용',
  '여우0pnux',
  'NU하우스',
  '여우W92F5',
  '냥이BqfgN',
  '냥이B9F87',
  '토끼o01xo',
  '토끼UgmMP',
  '스무스한포기',
  '여우v2hQY',
  '냥이lJHkW',
  'shannii',
  '냥이KxnxQ',
  '갱쥐HA0o3',
  'unniOBU2Ho',
  'はぴはぴ87',
] as const;

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

type CliOptions = {
  inputPath: string;
  outputPath: string;
};

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let inputPath = DEFAULT_INPUT_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;

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
  }

  return { inputPath, outputPath };
}

function getExistingId(row: Row): string {
  const raw = row['기존 아이디'];
  return String(raw ?? '').trim();
}

async function filterReviewJson(): Promise<void> {
  const { inputPath, outputPath } = parseCliOptions();

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw) as unknown;

  if (!Array.isArray(data)) {
    throw new Error('입력 JSON 형식이 올바르지 않습니다. (배열이 아닙니다)');
  }

  const targetSet = new Set<string>(TARGET_EXISTING_IDS);

  const filtered = (data as Row[]).filter((row) => targetSet.has(getExistingId(row)));

  const foundSet = new Set<string>(filtered.map(getExistingId));
  const missing = TARGET_EXISTING_IDS.filter((id) => !foundSet.has(id));

  ensureDirForFile(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf-8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        inputPath,
        inputRows: data.length,
        outputPath,
        outputRows: filtered.length,
        missingIdsCount: missing.length,
        missingIds: missing,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  filterReviewJson()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}

export { filterReviewJson };

