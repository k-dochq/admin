import { PrismaClient, type Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// 엑셀 파일 경로
const EXCEL_FILE = path.join(__dirname, '고민부위-매핑결과.xlsx');
const UPDATE_PROGRESS_FILE = path.join(__dirname, '../../output/reviews-update-progress.json');

// Dry run 모드 확인
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');

// 엑셀 행 타입
type ExcelRow = {
  reviewId?: string;
  병원명?: string;
  '시술부위 카테고리'?: string;
  '고민부위 (한국어)'?: string;
  '고민부위 (영어)'?: string;
  '고민부위 (태국어)'?: string;
  '고민부위 (일본어)'?: string;
  '고민부위 (중국어번체)'?: string;
  '고민부위 (힌디어)'?: string;
  '고민부위 (필리핀어)'?: string;
};

// 업데이트 진행 상황 타입
interface UpdateProgress {
  processedCount: number;
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastProcessedIndex: number;
  startTime: string;
  lastUpdateTime: string;
  failedReviewIds: string[];
}

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
function loadExcelFile(filePath: string): { sheetName: string; rows: ExcelRow[] } {
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

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    defval: '',
    blankrows: false,
  });

  return { sheetName, rows };
}

/**
 * 진행 상황을 저장하는 함수
 */
function saveUpdateProgress(progress: UpdateProgress): void {
  ensureDirForFile(UPDATE_PROGRESS_FILE);
  fs.writeFileSync(UPDATE_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * 진행 상황을 로드하는 함수
 */
function loadUpdateProgress(): UpdateProgress | null {
  try {
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      const data = fs.readFileSync(UPDATE_PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('진행 상황 파일 로드 중 오류:', error);
  }
  return null;
}

/**
 * 단일 Review 업데이트
 */
async function updateReviewConcerns(row: ExcelRow): Promise<{ success: boolean; reviewId: string; error?: string }> {
  const reviewId = safeString(row.reviewId);

  if (!reviewId) {
    return { success: false, reviewId: '', error: 'reviewId가 없습니다' };
  }

  try {
    // 현재 Review 조회
    const currentReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, concerns: true, concernsMultilingual: true },
    });

    if (!currentReview) {
      return { success: false, reviewId, error: 'Review를 찾을 수 없습니다' };
    }

    // 엑셀에서 읽은 고민부위 데이터
    const koText = safeString(row['고민부위 (한국어)']);
    const enText = safeString(row['고민부위 (영어)']);
    const thText = safeString(row['고민부위 (태국어)']);
    const jaText = safeString(row['고민부위 (일본어)']);
    const zhText = safeString(row['고민부위 (중국어번체)']);
    const hiText = safeString(row['고민부위 (힌디어)']);
    const tlText = safeString(row['고민부위 (필리핀어)']);

    // concernsMultilingual 객체 생성
    const concernsMultilingual: Record<string, string> = {};

    if (koText) concernsMultilingual.ko_KR = koText;
    if (enText) concernsMultilingual.en_US = enText;
    if (thText) concernsMultilingual.th_TH = thText;
    if (jaText) concernsMultilingual.ja_JP = jaText;
    if (zhText) concernsMultilingual.zh_TW = zhText;
    if (hiText) concernsMultilingual.hi_IN = hiText;
    if (tlText) concernsMultilingual.tl_PH = tlText;

    // Review 업데이트
    const updateData: {
      concerns: string | null;
      concernsMultilingual?: Prisma.InputJsonValue;
    } = {
      concerns: koText || null, // 한국어는 concerns 필드에도 저장
    };

    // concernsMultilingual이 비어있지 않을 때만 추가
    if (Object.keys(concernsMultilingual).length > 0) {
      updateData.concernsMultilingual = concernsMultilingual as Prisma.InputJsonValue;
    }

    // Dry run 모드에서는 실제 업데이트하지 않음
    if (DRY_RUN) {
      console.log(`[DRY RUN] Review ${reviewId} 업데이트 예정:`, JSON.stringify(updateData, null, 2));
    } else {
      await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
      });
    }

    return { success: true, reviewId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, reviewId, error: errorMessage };
  }
}

/**
 * 메인 업데이트 함수
 */
async function updateReviewsFromExcel(): Promise<void> {
  try {
    console.log('📖 엑셀 파일 읽기 중...');
    console.log(`파일 경로: ${EXCEL_FILE}`);

    const { sheetName, rows } = loadExcelFile(EXCEL_FILE);
    console.log(`시트 이름: ${sheetName}`);
    console.log(`총 ${rows.length}개 행 발견`);

    // 기존 진행 상황 로드
    let progress = loadUpdateProgress();

    if (progress) {
      console.log(
        `🔄 이전 작업 재개: ${progress.processedCount}/${progress.totalCount} 완료 (성공: ${progress.successCount}, 실패: ${progress.failureCount})`,
      );
      console.log(`실패한 Review ID: ${progress.failedReviewIds.length}개`);
    } else {
      progress = {
        processedCount: 0,
        totalCount: rows.length,
        successCount: 0,
        failureCount: 0,
        lastProcessedIndex: -1,
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
        failedReviewIds: [],
      };
    }

    // 배치 크기 설정
    const BATCH_SIZE = 20;
    let startIndex = progress.lastProcessedIndex + 1;

    console.log(`\n🔄 Review 업데이트 시작...`);
    if (DRY_RUN) {
      console.log('⚠️  DRY RUN 모드: 실제 DB 업데이트를 수행하지 않습니다.');
    }
    console.log(`배치 크기: ${BATCH_SIZE}`);

    while (startIndex < rows.length) {
      const endIndex = Math.min(startIndex + BATCH_SIZE, rows.length);
      const batch = rows.slice(startIndex, endIndex);

      console.log(`\n📝 처리 중: ${startIndex + 1}-${endIndex}/${rows.length}`);

      // 배치별 업데이트 처리
      const updatePromises = batch.map(async (row) => {
        return await updateReviewConcerns(row);
      });

      // 배치 결과 처리
      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchSuccessCount = results.filter((r) => r.success).length;
      const batchFailureCount = results.filter((r) => !r.success).length;

      // 실패한 Review ID 수집
      const batchFailedIds = results.filter((r) => !r.success).map((r) => r.reviewId);

      progress.processedCount = endIndex;
      progress.successCount += batchSuccessCount;
      progress.failureCount += batchFailureCount;
      progress.lastProcessedIndex = endIndex - 1;
      progress.lastUpdateTime = new Date().toISOString();
      progress.failedReviewIds = [...progress.failedReviewIds, ...batchFailedIds];

      // 진행 상황 저장
      saveUpdateProgress(progress);

      console.log(`✅ 배치 완료: 성공 ${batchSuccessCount}개, 실패 ${batchFailureCount}개`);
      console.log(
        `📊 전체 진행률: ${progress.processedCount}/${progress.totalCount} (${Math.round((progress.processedCount / progress.totalCount) * 100)}%)`,
      );

      // 실패한 항목 로그
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        console.log('❌ 실패한 항목들:');
        failures.forEach((failure) => {
          console.log(`  - ${failure.reviewId}: ${failure.error || 'Unknown error'}`);
        });
      }

      startIndex = endIndex;

      // DB 부하 방지를 위한 짧은 대기
      if (startIndex < rows.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 모든 Review 업데이트 완료!');
    console.log(`📊 최종 결과:`);
    console.log(`  - 총 처리: ${progress.processedCount}개`);
    console.log(`  - 성공: ${progress.successCount}개`);
    console.log(`  - 실패: ${progress.failureCount}개`);
    console.log(`  - 성공률: ${Math.round((progress.successCount / progress.processedCount) * 100)}%`);

    if (progress.failedReviewIds.length > 0) {
      console.log(`\n⚠️  실패한 Review ID 목록 (${progress.failedReviewIds.length}개):`);
      progress.failedReviewIds.forEach((id) => {
        console.log(`  - ${id}`);
      });
    }

    // 완료 후 진행 상황 파일 삭제
    if (fs.existsSync(UPDATE_PROGRESS_FILE)) {
      fs.unlinkSync(UPDATE_PROGRESS_FILE);
      console.log('\n✅ 진행 상황 파일 삭제 완료');
    }
  } catch (error) {
    console.error('❌ 업데이트 작업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateReviewsFromExcel()
    .then(() => {
      console.log('\n✅ 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateReviewsFromExcel };
