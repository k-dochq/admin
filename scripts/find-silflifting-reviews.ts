import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 리뷰 데이터에서 #Silflifting 텍스트를 포함하는 데이터를 찾는 스크립트
 *
 * 검색 대상:
 * 1. concerns 필드 (고민부위)
 * 2. title 필드 (리뷰 제목)
 * 3. concernsMultilingual 필드 (다국어 고민부위)
 */
async function findSilfliftingReviews() {
  console.log('🔍 #Silflifting 텍스트 검색을 시작합니다...\n');

  try {
    // 1. concerns 필드에서 검색
    const concernsResults = await prisma.review.findMany({
      where: {
        concerns: {
          contains: '#Silflifting',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        concerns: true,
        concernsMultilingual: true,
        createdAt: true,
      },
    });

    // 2. title 필드에서 검색 (JSON 필드이므로 raw SQL 사용)
    const titleResults = (await prisma.$queryRaw`
      SELECT id, title, concerns, "concernsMultilingual", "createdAt"
      FROM "Review"
      WHERE title::text ILIKE '%#Silflifting%'
    `) as any[];

    // 3. concernsMultilingual 필드에서 검색 (JSON 필드이므로 raw SQL 사용)
    const concernsMultilingualResults = (await prisma.$queryRaw`
      SELECT id, title, concerns, "concernsMultilingual", "createdAt"
      FROM "Review"
      WHERE "concernsMultilingual"::text ILIKE '%#Silflifting%'
    `) as any[];

    // 중복 제거를 위해 Set 사용
    const allIds = new Set<string>();

    // concerns 결과 추가
    concernsResults.forEach((review) => allIds.add(review.id));

    // title 결과 추가
    titleResults.forEach((review: any) => allIds.add(review.id));

    // concernsMultilingual 결과 추가
    concernsMultilingualResults.forEach((review: any) => allIds.add(review.id));

    // 전체 결과 수집
    const allResults = await prisma.review.findMany({
      where: {
        id: {
          in: Array.from(allIds),
        },
      },
      select: {
        id: true,
        title: true,
        concerns: true,
        concernsMultilingual: true,
        createdAt: true,
        hospital: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 결과 출력
    console.log('📊 검색 결과 요약:');
    console.log(`- concerns 필드에서 발견: ${concernsResults.length}개`);
    console.log(`- title 필드에서 발견: ${titleResults.length}개`);
    console.log(`- concernsMultilingual 필드에서 발견: ${concernsMultilingualResults.length}개`);
    console.log(`- 전체 중복 제거 후: ${allResults.length}개\n`);

    console.log('📋 상세 결과:');
    allResults.forEach((review, index) => {
      console.log(`\n${index + 1}. 리뷰 ID: ${review.id}`);
      console.log(`   생성일: ${review.createdAt.toISOString().split('T')[0]}`);
      console.log(`   병원명: ${JSON.stringify(review.hospital.name)}`);
      console.log(`   제목: ${JSON.stringify(review.title)}`);
      console.log(`   고민부위: ${review.concerns}`);
      console.log(`   다국어 고민부위: ${JSON.stringify(review.concernsMultilingual)}`);
    });

    console.log(
      `\n✅ 검색 완료! 총 ${allResults.length}개의 리뷰에서 #Silflifting 텍스트를 발견했습니다.`,
    );
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
findSilfliftingReviews().catch((error) => {
  console.error('스크립트 실행 중 오류:', error);
  process.exit(1);
});
