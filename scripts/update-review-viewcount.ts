import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// LocalizedText 타입 정의
type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

// 다국어 리뷰 제목에서 한국어 제목을 추출하는 함수
function getReviewTitle(title: Prisma.JsonValue): string {
  if (!title) return 'Unknown';
  if (typeof title === 'string') return title;

  if (typeof title === 'object' && title !== null && !Array.isArray(title)) {
    const localizedText = title as LocalizedText;
    return localizedText.ko_KR || localizedText.en_US || localizedText.th_TH || 'Unknown';
  }

  return 'Unknown';
}

/**
 * Review 데이터의 viewCount를 적절한 랜덤값으로 업데이트하는 스크립트
 *
 * 업데이트 규칙:
 * - viewCount: 0-1000 사이의 랜덤값 (실제 조회수 시뮬레이션)
 * - 더 현실적인 분포를 위해 가중치 적용:
 *   - 70% 확률로 0-100 (낮은 조회수)
 *   - 20% 확률로 100-500 (중간 조회수)
 *   - 10% 확률로 500-1000 (높은 조회수)
 */
async function updateReviewViewCount() {
  try {
    console.log('📝 Review 데이터 업데이트 시작...');

    // 모든 리뷰 조회
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 총 ${reviews.length}개의 리뷰를 업데이트합니다.`);

    // 각 리뷰에 대해 랜덤값 생성 및 업데이트
    const updatePromises = reviews.map(async (review) => {
      // 가중치를 적용한 랜덤값 생성
      const random = Math.random();
      let viewCount: number;

      if (random < 0.7) {
        // 70% 확률로 0-100 (낮은 조회수)
        viewCount = Math.floor(Math.random() * 101);
      } else if (random < 0.9) {
        // 20% 확률로 100-500 (중간 조회수)
        viewCount = Math.floor(Math.random() * 401) + 100;
      } else {
        // 10% 확률로 500-1000 (높은 조회수)
        viewCount = Math.floor(Math.random() * 501) + 500;
      }

      // 리뷰 정보 출력
      const reviewTitle = getReviewTitle(review.title);

      console.log(`  📝 ${reviewTitle}: viewCount ${review.viewCount} → ${viewCount}`);

      // 데이터베이스 업데이트
      return prisma.review.update({
        where: { id: review.id },
        data: {
          viewCount,
        },
      });
    });

    // 모든 업데이트 실행
    await Promise.all(updatePromises);

    console.log('✅ 모든 리뷰 데이터 업데이트 완료!');

    // 업데이트 결과 확인 - 상위 10개 조회수 높은 리뷰
    const topReviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
      },
      orderBy: [{ viewCount: 'desc' }, { likeCount: 'desc' }, { createdAt: 'asc' }],
      take: 10,
    });

    console.log('\n📈 업데이트 후 상위 10개 조회수 높은 리뷰:');
    topReviews.forEach((review, index) => {
      const reviewTitle = getReviewTitle(review.title);

      console.log(
        `  ${index + 1}. ${reviewTitle} - viewCount: ${review.viewCount}, likeCount: ${review.likeCount}`,
      );
    });

    // 통계 정보 출력
    const stats = await prisma.review.aggregate({
      _avg: {
        viewCount: true,
      },
      _max: {
        viewCount: true,
      },
      _min: {
        viewCount: true,
      },
      _count: {
        id: true,
      },
    });

    console.log('\n📊 리뷰 조회수 통계:');
    console.log(`  총 리뷰 수: ${stats._count.id}`);
    console.log(`  평균 조회수: ${Math.round(stats._avg.viewCount || 0)}`);
    console.log(`  최대 조회수: ${stats._max.viewCount}`);
    console.log(`  최소 조회수: ${stats._min.viewCount}`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateReviewViewCount()
    .then(() => {
      console.log('🎉 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateReviewViewCount };
