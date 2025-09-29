import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 리뷰 데이터에서 #Silflifting 텍스트를 #threadlifting으로 업데이트하는 스크립트
 *
 * 업데이트 대상:
 * 1. title 필드의 en_US 값
 * 2. concernsMultilingual 필드의 en_US 값
 * 3. concerns 필드는 한국어이므로 변경하지 않음
 */
async function updateSilfliftingToThreadlifting() {
  console.log('🔄 #Silflifting을 #threadlifting으로 업데이트를 시작합니다...\n');

  try {
    // 먼저 업데이트할 데이터를 찾기
    const reviewsToUpdate = (await prisma.$queryRaw`
      SELECT id, title, concerns, "concernsMultilingual", "createdAt"
      FROM "Review"
      WHERE title::text ILIKE '%#Silflifting%' OR "concernsMultilingual"::text ILIKE '%#Silflifting%'
    `) as any[];

    console.log(`📊 업데이트 대상 리뷰: ${reviewsToUpdate.length}개\n`);

    if (reviewsToUpdate.length === 0) {
      console.log('✅ 업데이트할 데이터가 없습니다.');
      return;
    }

    // 업데이트 전 데이터 확인
    console.log('📋 업데이트 전 데이터 샘플 (처음 3개):');
    reviewsToUpdate.slice(0, 3).forEach((review, index) => {
      console.log(`\n${index + 1}. 리뷰 ID: ${review.id}`);
      console.log(`   제목: ${JSON.stringify(review.title)}`);
      console.log(`   고민부위: ${review.concerns}`);
      console.log(`   다국어 고민부위: ${JSON.stringify(review.concernsMultilingual)}`);
    });

    // 업데이트 실행
    console.log('\n🔄 업데이트를 실행합니다...\n');

    let updatedCount = 0;

    for (const review of reviewsToUpdate) {
      const currentTitle = review.title;
      const currentConcernsMultilingual = review.concernsMultilingual;

      // title 필드 업데이트 (en_US만 변경)
      const updatedTitle = {
        ...currentTitle,
        en_US: currentTitle.en_US?.replace(/#Silflifting/g, '#threadlifting') || currentTitle.en_US,
      };

      // concernsMultilingual 필드 업데이트 (en_US만 변경)
      const updatedConcernsMultilingual = {
        ...currentConcernsMultilingual,
        en_US:
          currentConcernsMultilingual.en_US?.replace(/#Silflifting/g, '#threadlifting') ||
          currentConcernsMultilingual.en_US,
      };

      // 실제로 변경이 있는지 확인
      const titleChanged = JSON.stringify(currentTitle) !== JSON.stringify(updatedTitle);
      const concernsChanged =
        JSON.stringify(currentConcernsMultilingual) !== JSON.stringify(updatedConcernsMultilingual);

      if (titleChanged || concernsChanged) {
        await prisma.review.update({
          where: { id: review.id },
          data: {
            title: updatedTitle,
            concernsMultilingual: updatedConcernsMultilingual,
          },
        });

        updatedCount++;
        console.log(`✅ 업데이트 완료: ${review.id}`);
      } else {
        console.log(`⏭️  변경사항 없음: ${review.id}`);
      }
    }

    console.log(`\n📊 업데이트 완료: ${updatedCount}개 리뷰 업데이트됨`);

    // 업데이트 후 검증
    console.log('\n🔍 업데이트 후 검증을 수행합니다...\n');

    const remainingSilflifting = (await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Review"
      WHERE title::text ILIKE '%#Silflifting%' OR "concernsMultilingual"::text ILIKE '%#Silflifting%'
    `) as any[];

    const newThreadlifting = (await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Review"
      WHERE title::text ILIKE '%#threadlifting%' OR "concernsMultilingual"::text ILIKE '%#threadlifting%'
    `) as any[];

    console.log('📋 업데이트 후 검증 결과:');
    console.log(`- 남은 #Silflifting: ${remainingSilflifting[0].count}개`);
    console.log(`- 새로운 #threadlifting: ${newThreadlifting[0].count}개`);

    // 업데이트된 데이터 샘플 확인
    const updatedSamples = (await prisma.$queryRaw`
      SELECT id, title, concerns, "concernsMultilingual", "createdAt"
      FROM "Review"
      WHERE title::text ILIKE '%#threadlifting%' OR "concernsMultilingual"::text ILIKE '%#threadlifting%'
      LIMIT 3
    `) as any[];

    console.log('\n📋 업데이트 후 데이터 샘플 (처음 3개):');
    updatedSamples.forEach((review, index) => {
      console.log(`\n${index + 1}. 리뷰 ID: ${review.id}`);
      console.log(`   제목: ${JSON.stringify(review.title)}`);
      console.log(`   고민부위: ${review.concerns}`);
      console.log(`   다국어 고민부위: ${JSON.stringify(review.concernsMultilingual)}`);
    });

    console.log('\n✅ 업데이트 작업이 완료되었습니다!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
updateSilfliftingToThreadlifting().catch((error) => {
  console.error('스크립트 실행 중 오류:', error);
  process.exit(1);
});
