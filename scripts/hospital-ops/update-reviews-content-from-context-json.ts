import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 테스트 모드 설정 (true로 설정하면 첫 번째 항목만 업데이트)
const TEST_MODE = false;
const TEST_MAX_ITEMS = 1; // 테스트 모드일 때 처리할 최대 항목 수

// 입력 JSON 파일 경로 (hospital-ops 결과물)
const INPUT_FILE = path.resolve(__dirname, 'output', 'review-sheet-from-row-1678.filtered.with-review-ids.json');
const UPDATE_PROGRESS_FILE = path.resolve(
  __dirname,
  'output',
  'update-progress-review-content-from-context.json',
);

type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
  hi_IN?: string;
};

type ReviewSheetRow = Record<string, unknown> & {
  reviewId?: unknown;
  reviewMatchStatus?: unknown;
  문맥변경?: unknown;
  문맥변경_en_US?: unknown;
  문맥변경_th_TH?: unknown;
  문맥변경_zh_TW?: unknown;
  문맥변경_ja_JP?: unknown;
  문맥변경_hi_IN?: unknown;
  병원?: unknown;
  '기존 아이디'?: unknown;
};

interface UpdateProgress {
  processedCount: number;
  totalCount: number;
  successCount: number;
  skippedCount: number;
  failureCount: number;
  lastProcessedReviewId: string | null;
  startTime: string;
  lastUpdateTime: string;
}

function safeString(v: unknown): string {
  return String(v ?? '').trim();
}

function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

function saveUpdateProgress(progress: UpdateProgress): void {
  const outputDir = path.dirname(UPDATE_PROGRESS_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(UPDATE_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadUpdateProgress(): UpdateProgress | null {
  try {
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      const data = fs.readFileSync(UPDATE_PROGRESS_FILE, 'utf-8');
      return JSON.parse(data) as UpdateProgress;
    }
  } catch (error) {
    console.error('Error loading update progress:', error);
  }
  return null;
}

function loadRows(): ReviewSheetRow[] {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`입력 JSON 파일을 찾을 수 없습니다: ${INPUT_FILE}`);
  }

  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('입력 JSON 형식이 올바르지 않습니다. (배열이 아닙니다)');
  }
  return parsed as ReviewSheetRow[];
}

function extractContentTranslationsFromRow(row: ReviewSheetRow): Partial<LocalizedText> {
  const ko = normalizeLineEndings(safeString(row.문맥변경));
  const en = normalizeLineEndings(safeString(row.문맥변경_en_US));
  const th = normalizeLineEndings(safeString(row.문맥변경_th_TH));
  const zhTW = normalizeLineEndings(safeString(row.문맥변경_zh_TW));
  const ja = normalizeLineEndings(safeString(row.문맥변경_ja_JP));
  const hi = normalizeLineEndings(safeString(row.문맥변경_hi_IN));

  const out: Partial<LocalizedText> = {};
  if (ko) out.ko_KR = ko;
  if (en) out.en_US = en;
  if (th) out.th_TH = th;
  if (zhTW) out.zh_TW = zhTW;
  if (ja) out.ja_JP = ja;
  if (hi) out.hi_IN = hi;
  return out;
}

function mergeLocalizedText(existing: Prisma.JsonValue, next: Partial<LocalizedText>): Prisma.InputJsonValue {
  // 기존 데이터는 최대한 보존 (추가 키가 있을 수 있음)
  const current: Record<string, unknown> =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : typeof existing === 'string'
        ? { ko_KR: existing }
        : {};

  const merged: Record<string, unknown> = { ...current };
  for (const [k, v] of Object.entries(next)) {
    if (typeof v === 'string' && v.trim() !== '') {
      merged[k] = v;
    }
  }

  return merged as Prisma.InputJsonValue;
}

function hasAnyTranslation(next: Partial<LocalizedText>): boolean {
  return Object.values(next).some((v) => typeof v === 'string' && v.trim() !== '');
}

async function updateReviewsContentFromContextJson(): Promise<void> {
  try {
    console.log('🔄 hospital-ops JSON 기반 Review.content 다국어 업데이트 시작...');
    console.log(`📄 입력 파일: ${INPUT_FILE}`);

    const allRows = loadRows();

    // reviewId가 있는 항목만 대상으로
    const updatableRows = allRows.filter((row) => safeString(row.reviewId) !== '');
    console.log(`📊 총 ${allRows.length}개 중 reviewId가 있는 ${updatableRows.length}개를 대상으로 합니다.`);

    // 테스트 모드일 경우 첫 번째 항목만 처리
    const rows = TEST_MODE ? updatableRows.slice(0, TEST_MAX_ITEMS) : updatableRows;
    if (TEST_MODE) {
      console.log(`🧪 테스트 모드: ${TEST_MAX_ITEMS}개 항목만 처리합니다.`);
    }

    let progress = loadUpdateProgress();
    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 스킵: ${progress.skippedCount}, 실패: ${progress.failureCount})`,
      );
    } else {
      progress = {
        processedCount: 0,
        totalCount: rows.length,
        successCount: 0,
        skippedCount: 0,
        failureCount: 0,
        lastProcessedReviewId: null,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
      };
    }

    const BATCH_SIZE = 20;
    let startIndex = progress.processedCount;

    while (startIndex < rows.length) {
      const endIndex = Math.min(startIndex + BATCH_SIZE, rows.length);
      const batch = rows.slice(startIndex, endIndex);

      console.log(`\n📝 처리 중: ${startIndex + 1}-${endIndex}/${rows.length}`);

      const updatePromises = batch.map(async (row) => {
        const reviewId = safeString(row.reviewId);
        const existingId = safeString(row['기존 아이디']);
        const hospital = safeString(row.병원);

        try {
          if (!reviewId) {
            return { success: true, skipped: true, id: '(missing)', error: null };
          }

          const translations = extractContentTranslationsFromRow(row);
          if (!hasAnyTranslation(translations)) {
            console.log(`  ⏭️  SKIP(no translations) reviewId=${reviewId} existingId=${existingId} hospital=${hospital}`);
            return { success: true, skipped: true, id: reviewId, error: null };
          }

          const currentReview = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true, content: true },
          });

          if (!currentReview) {
            console.warn(`⚠️  리뷰를 찾을 수 없습니다: ${reviewId}`);
            return { success: false, skipped: false, id: reviewId, error: 'Review not found' };
          }

          // content 다국어 업데이트 (기존 보존 + 값 있는 언어만 덮어쓰기)
          const nextContent = mergeLocalizedText(currentReview.content, translations);

          await prisma.review.update({
            where: { id: reviewId },
            data: { content: nextContent },
          });

          return { success: true, skipped: false, id: reviewId, error: null };
        } catch (error) {
          console.error(`❌ 업데이트 실패 (${reviewId}):`, error);
          return {
            success: false,
            skipped: false,
            id: reviewId,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(updatePromises);

      const batchSuccessCount = results.filter((r) => r.success && !r.skipped).length;
      const batchSkippedCount = results.filter((r) => r.success && r.skipped).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      progress.processedCount = endIndex;
      progress.successCount += batchSuccessCount;
      progress.skippedCount += batchSkippedCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedReviewId = safeString(batch[batch.length - 1]?.reviewId) || null;
      progress.lastUpdateTime = new Date().toISOString();

      saveUpdateProgress(progress);

      console.log(`✅ 배치 완료: 성공 ${batchSuccessCount}개, 스킵 ${batchSkippedCount}개, 실패 ${batchFailureCount}개`);
      console.log(
        `📊 전체 진행률: ${progress.processedCount}/${progress.totalCount} (${Math.round((progress.processedCount / progress.totalCount) * 100)}%)`,
      );

      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        console.log('❌ 실패한 항목들:');
        failures.forEach((failure) => {
          console.log(`  - ${failure.id}: ${failure.error}`);
        });
      }

      startIndex = endIndex;

      if (startIndex < rows.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 Review.content 다국어 업데이트 완료!');
    console.log(`📊 최종 결과:`);
    console.log(`  - 총 처리: ${progress.processedCount}개`);
    console.log(`  - 성공: ${progress.successCount}개`);
    console.log(`  - 스킵: ${progress.skippedCount}개`);
    console.log(`  - 실패: ${progress.failureCount}개`);
  } catch (error) {
    console.error('❌ 업데이트 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateReviewsContentFromContextJson()
    .then(() => {
      console.log('✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateReviewsContentFromContextJson };

