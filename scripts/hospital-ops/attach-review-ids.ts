import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

type Row = Record<string, unknown>;

type CliOptions = {
  inputPath: string;
  outputPath: string;
  debugLimit?: number;
};

const DEFAULT_INPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.json',
);

const DEFAULT_OUTPUT_PATH = path.resolve(
  __dirname,
  'output',
  'review-sheet-from-row-1678.filtered.with-review-ids.json',
);

const prisma = new PrismaClient();

function ensureDirForFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);

  let inputPath = DEFAULT_INPUT_PATH;
  let outputPath = DEFAULT_OUTPUT_PATH;
  let debugLimit: number | undefined;

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

    if (arg === '--debugLimit' && next) {
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 1) {
        throw new Error(`--debugLimit 값이 올바르지 않습니다: ${next}`);
      }
      debugLimit = Math.floor(parsed);
      i += 1;
      continue;
    }
  }

  return { inputPath, outputPath, debugLimit };
}

function getString(row: Row, key: string): string {
  const v = row[key];
  return String(v ?? '').trim();
}

function getNumber(row: Row, key: string): number | undefined {
  const raw = row[key];
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const parsed = Number(String(raw ?? '').trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getDate(row: Row, key: string): Date | undefined {
  const raw = row[key];
  const s = String(raw ?? '').trim();
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function normalizeText(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractKoText(jsonValue: Prisma.JsonValue | null): string {
  if (jsonValue == null) return '';
  if (typeof jsonValue === 'string') return jsonValue;
  if (typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    const obj = jsonValue as Record<string, unknown>;
    const ko = obj['ko_KR'] ?? obj['ko'];
    if (typeof ko === 'string') return ko;
  }
  return '';
}

async function findHospitalIdByKoName(hospitalNameKo: string): Promise<string | null> {
  const name = hospitalNameKo.trim();
  if (!name) return null;

  const tryPaths: Array<Array<string>> = [['ko_KR'], ['ko']];

  for (const p of tryPaths) {
    const found = await prisma.hospital.findFirst({
      where: { name: { path: p, equals: name } },
      select: { id: true },
    });
    if (found) return found.id;
  }

  // fallback: string_contains (부분 일치)
  for (const p of tryPaths) {
    const found = await prisma.hospital.findFirst({
      where: { name: { path: p, string_contains: name } },
      select: { id: true },
    });
    if (found) return found.id;
  }

  return null;
}

async function findUserId({
  email,
  existingId,
}: {
  email: string;
  existingId: string;
}): Promise<string | null> {
  if (email) {
    const userByEmail = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (userByEmail) return userByEmail.id;
  }

  if (existingId) {
    const userByNick = await prisma.user.findFirst({
      where: { nickName: existingId },
      select: { id: true },
    });
    if (userByNick) return userByNick.id;

    const userByDisplay = await prisma.user.findFirst({
      where: { displayName: existingId },
      select: { id: true },
    });
    if (userByDisplay) return userByDisplay.id;
  }

  return null;
}

type ReviewCandidate = {
  id: string;
  rating: number;
  createdAt: Date;
  concerns: string | null;
  content: Prisma.JsonValue | null;
};

function scoreCandidate({
  candidate,
  expectedRating,
  expectedContent,
  expectedConcerns,
  expectedDate,
}: {
  candidate: ReviewCandidate;
  expectedRating?: number;
  expectedContent: string;
  expectedConcerns: string;
  expectedDate?: Date;
}): number {
  let score = 0;

  if (typeof expectedRating === 'number') {
    if (Math.abs(candidate.rating - expectedRating) < 0.0001) score += 2;
  }

  if (expectedConcerns) {
    const c = (candidate.concerns ?? '').trim();
    if (c && normalizeText(c) === normalizeText(expectedConcerns)) score += 2;
    else if (c && normalizeText(expectedConcerns).includes(normalizeText(c))) score += 1;
  }

  const candidateText = extractKoText(candidate.content);
  if (expectedContent && candidateText) {
    const a = normalizeText(expectedContent);
    const b = normalizeText(candidateText);
    if (a === b) score += 10;
    else if (a.replace(/\s+/g, '') === b.replace(/\s+/g, '')) score += 8;
    else if (b.includes(a) || a.includes(b)) score += 5;
  }

  if (expectedDate) {
    const diffMs = Math.abs(candidate.createdAt.getTime() - expectedDate.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours <= 1) score += 3;
    else if (diffHours <= 24) score += 1;
  }

  return score;
}

async function findBestReviewIdForRow(row: Row): Promise<{
  reviewId: string | null;
  status: 'matched' | 'not_found' | 'ambiguous';
  debug?: {
    userId: string | null;
    hospitalId: string | null;
    candidateCount: number;
    topScore?: number;
    topIds?: string[];
  };
}> {
  const existingId = getString(row, '기존 아이디');
  const email = getString(row, '사용자 아이디(@example)');
  const hospitalName = getString(row, '병원');
  const expectedRating = getNumber(row, '별점');
  const expectedContent = getString(row, '후기 내용');
  const expectedConcerns = getString(row, '고민부위');
  const expectedDate = getDate(row, '시술시기'); // 실제로는 생성시각일 수도 있어 근접도 점수로만 활용

  const userId = await findUserId({ email, existingId });
  const hospitalId = await findHospitalIdByKoName(hospitalName);

  if (!userId || !hospitalId) {
    return {
      reviewId: null,
      status: 'not_found',
      debug: { userId, hospitalId, candidateCount: 0 },
    };
  }

  const baseWhere: Prisma.ReviewWhereInput = {
    userId,
    hospitalId,
  };

  const select = {
    id: true,
    rating: true,
    createdAt: true,
    concerns: true,
    content: true,
  } satisfies Prisma.ReviewSelect;

  const withRatingWhere =
    typeof expectedRating === 'number' ? { ...baseWhere, rating: expectedRating } : baseWhere;

  let candidates = (await prisma.review.findMany({
    where: withRatingWhere,
    select,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })) as ReviewCandidate[];

  if (candidates.length === 0 && typeof expectedRating === 'number') {
    candidates = (await prisma.review.findMany({
      where: baseWhere,
      select,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })) as ReviewCandidate[];
  }

  if (candidates.length === 0) {
    return {
      reviewId: null,
      status: 'not_found',
      debug: { userId, hospitalId, candidateCount: 0 },
    };
  }

  const scored = candidates
    .map((c) => ({
      id: c.id,
      score: scoreCandidate({
        candidate: c,
        expectedRating,
        expectedContent,
        expectedConcerns,
        expectedDate,
      }),
    }))
    .sort((a, b) => b.score - a.score);

  const topScore = scored[0]?.score ?? 0;
  const topIds = scored.filter((s) => s.score === topScore).map((s) => s.id);

  if (topScore <= 0) {
    return {
      reviewId: null,
      status: 'not_found',
      debug: { userId, hospitalId, candidateCount: candidates.length, topScore, topIds },
    };
  }

  if (topIds.length > 1) {
    return {
      reviewId: null,
      status: 'ambiguous',
      debug: { userId, hospitalId, candidateCount: candidates.length, topScore, topIds },
    };
  }

  return {
    reviewId: topIds[0] ?? null,
    status: 'matched',
    debug: { userId, hospitalId, candidateCount: candidates.length, topScore, topIds },
  };
}

async function attachReviewIds(): Promise<void> {
  const { inputPath, outputPath, debugLimit } = parseCliOptions();
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw) as unknown;

  if (!Array.isArray(data)) {
    throw new Error('입력 JSON 형식이 올바르지 않습니다. (배열이 아닙니다)');
  }

  const rows = data as Row[];
  const targetRows = typeof debugLimit === 'number' ? rows.slice(0, debugLimit) : rows;

  let matched = 0;
  let notFound = 0;
  let ambiguous = 0;

  const enriched: Array<Row & { reviewId: string | null; reviewMatchStatus: string }> = [];

  for (const row of targetRows) {
    const res = await findBestReviewIdForRow(row);
    if (res.status === 'matched') matched += 1;
    else if (res.status === 'ambiguous') ambiguous += 1;
    else notFound += 1;

    enriched.push({
      ...row,
      reviewId: res.reviewId,
      reviewMatchStatus: res.status,
    });
  }

  ensureDirForFile(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf-8');

  console.log(
    JSON.stringify(
      {
        ok: true,
        inputPath,
        inputRows: rows.length,
        processedRows: targetRows.length,
        outputPath,
        matched,
        ambiguous,
        notFound,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  attachReviewIds()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { attachReviewIds };

