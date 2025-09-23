import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface GenerateHospitalLikesOptions {
  totalLikes?: number; // 생성할 총 좋아요 수
  maxLikesPerHospital?: number; // 병원당 최대 좋아요 수
  maxLikesPerUser?: number; // 사용자당 최대 좋아요 수
}

/**
 * 병원 좋아요 데이터를 랜덤하게 생성하는 스크립트
 */
async function generateHospitalLikes(options: GenerateHospitalLikesOptions = {}) {
  const {
    totalLikes = 2000, // 기본값: 2000개의 좋아요 생성
    maxLikesPerHospital = 100, // 병원당 최대 100개 좋아요
    maxLikesPerUser = 50, // 사용자당 최대 50개 좋아요
  } = options;

  console.log('🚀 병원 좋아요 데이터 생성 시작...');
  console.log(
    `📊 설정: 총 ${totalLikes}개 좋아요, 병원당 최대 ${maxLikesPerHospital}개, 사용자당 최대 ${maxLikesPerUser}개`,
  );

  try {
    // 1. 활성 사용자와 병원 ID 가져오기
    console.log('📋 사용자 및 병원 데이터 조회 중...');

    const [activeUsers, hospitals] = await Promise.all([
      prisma.user.findMany({
        where: { userStatusType: 'ACTIVE' },
        select: { id: true },
      }),
      prisma.hospital.findMany({
        select: { id: true },
      }),
    ]);

    console.log(`👥 활성 사용자: ${activeUsers.length}명`);
    console.log(`🏥 병원: ${hospitals.length}개`);

    if (activeUsers.length === 0 || hospitals.length === 0) {
      throw new Error('사용자 또는 병원 데이터가 없습니다.');
    }

    // 2. 기존 좋아요 데이터 확인
    const existingLikes = await prisma.hospitalLike.findMany({
      select: { userId: true, hospitalId: true },
    });

    console.log(`💖 기존 좋아요: ${existingLikes.length}개`);

    // 3. 기존 좋아요를 Set으로 변환하여 중복 체크용으로 사용
    const existingLikeSet = new Set(
      existingLikes.map((like) => `${like.userId}-${like.hospitalId}`),
    );

    // 4. 사용자별, 병원별 좋아요 수 추적
    const userLikeCount = new Map<string, number>();
    const hospitalLikeCount = new Map<string, number>();

    // 기존 데이터로 카운트 초기화
    existingLikes.forEach((like) => {
      userLikeCount.set(like.userId, (userLikeCount.get(like.userId) || 0) + 1);
      hospitalLikeCount.set(like.hospitalId, (hospitalLikeCount.get(like.hospitalId) || 0) + 1);
    });

    // 5. 랜덤 좋아요 생성
    const newLikes: Array<{ id: string; userId: string; hospitalId: string; createdAt: Date }> = [];
    let generatedCount = 0;
    let attempts = 0;
    const maxAttempts = totalLikes * 10; // 무한 루프 방지

    console.log('🎲 랜덤 좋아요 생성 중...');

    while (generatedCount < totalLikes && attempts < maxAttempts) {
      attempts++;

      // 랜덤 사용자와 병원 선택
      const randomUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];
      const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];

      const likeKey = `${randomUser.id}-${randomHospital.id}`;

      // 중복 체크
      if (existingLikeSet.has(likeKey)) {
        continue;
      }

      // 사용자당 최대 좋아요 수 체크
      const userLikes = userLikeCount.get(randomUser.id) || 0;
      if (userLikes >= maxLikesPerUser) {
        continue;
      }

      // 병원당 최대 좋아요 수 체크
      const hospitalLikes = hospitalLikeCount.get(randomHospital.id) || 0;
      if (hospitalLikes >= maxLikesPerHospital) {
        continue;
      }

      // 새 좋아요 생성
      const newLike = {
        id: randomUUID(),
        userId: randomUser.id,
        hospitalId: randomHospital.id,
        createdAt: new Date(),
      };

      newLikes.push(newLike);
      existingLikeSet.add(likeKey);
      userLikeCount.set(randomUser.id, userLikes + 1);
      hospitalLikeCount.set(randomHospital.id, hospitalLikes + 1);
      generatedCount++;

      // 진행률 표시
      if (generatedCount % 500 === 0) {
        console.log(`✅ ${generatedCount}/${totalLikes} 좋아요 생성 완료`);
      }
    }

    console.log(`🎯 총 ${generatedCount}개의 좋아요 생성 완료 (시도: ${attempts}회)`);

    if (newLikes.length === 0) {
      console.log('⚠️  생성된 좋아요가 없습니다. 제한 조건을 확인해주세요.');
      return;
    }

    // 6. 데이터베이스에 일괄 삽입
    console.log('💾 데이터베이스에 저장 중...');

    const batchSize = 1000;
    for (let i = 0; i < newLikes.length; i += batchSize) {
      const batch = newLikes.slice(i, i + batchSize);
      await prisma.hospitalLike.createMany({
        data: batch,
        skipDuplicates: true,
      });
      console.log(
        `📦 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(newLikes.length / batchSize)} 저장 완료`,
      );
    }

    // 7. 병원별 좋아요 수는 HospitalLike 테이블에서 직접 계산되므로 별도 업데이트 불필요
    console.log('✅ 병원별 좋아요 수는 HospitalLike 테이블에서 자동으로 계산됩니다.');

    // 8. 결과 통계 출력
    console.log('\n📊 생성 완료! 통계:');
    console.log(`💖 새로 생성된 좋아요: ${newLikes.length}개`);
    console.log(`👥 참여한 사용자 수: ${userLikeCount.size}명`);
    console.log(`🏥 좋아요가 있는 병원 수: ${hospitalLikeCount.size}개`);

    // 좋아요 수 분포 통계
    const likeCounts = Array.from(hospitalLikeCount.values());
    const maxLikes = Math.max(...likeCounts);
    const avgLikes = likeCounts.reduce((sum, count) => sum + count, 0) / likeCounts.length;

    console.log(`📈 병원별 좋아요 수 통계:`);
    console.log(`   - 최대: ${maxLikes}개`);
    console.log(`   - 평균: ${avgLikes.toFixed(2)}개`);
    console.log(`   - 0개: ${hospitals.length - hospitalLikeCount.size}개`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 스크립트 실행
 */
async function main() {
  const args = process.argv.slice(2);

  // 명령행 인수 파싱
  const options: GenerateHospitalLikesOptions = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--total':
        options.totalLikes = parseInt(value, 10);
        break;
      case '--max-per-hospital':
        options.maxLikesPerHospital = parseInt(value, 10);
        break;
      case '--max-per-user':
        options.maxLikesPerUser = parseInt(value, 10);
        break;
    }
  }

  console.log('🎯 병원 좋아요 생성 스크립트');
  console.log(
    '사용법: npm run generate-hospital-likes [--total 2000] [--max-per-hospital 100] [--max-per-user 50]',
  );
  console.log('');

  await generateHospitalLikes(options);
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

export { generateHospitalLikes };
