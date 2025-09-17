import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Hospital name 타입 정의
type HospitalName = Prisma.JsonValue;

// 다국어 병원명에서 한국어 이름을 추출하는 함수
function getHospitalName(name: HospitalName): string {
  if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
    const nameObj = name as Record<string, unknown>;
    return (nameObj.ko_KR as string) || (nameObj.en_US as string) || 'Unknown';
  }
  return 'Unknown';
}

/**
 * Hospital 데이터의 ranking, rating, reviewCount를 적절한 랜덤값으로 업데이트하는 스크립트
 *
 * 업데이트 규칙:
 * - ranking: 1-10 사이의 랜덤값 (1이 최고 순위)
 * - rating: 3.0-5.0 사이의 랜덤값 (소수점 1자리)
 * - reviewCount: 0-200 사이의 랜덤값
 */
async function updateHospitalRankingData() {
  try {
    console.log('🏥 Hospital 데이터 업데이트 시작...');

    // 모든 승인된 병원 조회
    const hospitals = await prisma.hospital.findMany({
      where: {
        approvalStatusType: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        ranking: true,
        rating: true,
        reviewCount: true,
      },
    });

    console.log(`📊 총 ${hospitals.length}개의 병원을 업데이트합니다.`);

    // 각 병원에 대해 랜덤값 생성 및 업데이트
    const updatePromises = hospitals.map(async (hospital) => {
      // 랜덤값 생성
      const ranking = Math.floor(Math.random() * 10) + 1; // 1-10
      const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0-5.0 (소수점 1자리)
      const reviewCount = Math.floor(Math.random() * 201); // 0-200

      // 병원 정보 출력
      const hospitalName = getHospitalName(hospital.name);

      console.log(
        `  📝 ${hospitalName}: ranking ${hospital.ranking} → ${ranking}, rating ${hospital.rating} → ${rating}, reviewCount ${hospital.reviewCount} → ${reviewCount}`,
      );

      // 데이터베이스 업데이트
      return prisma.hospital.update({
        where: { id: hospital.id },
        data: {
          ranking,
          rating,
          reviewCount,
        },
      });
    });

    // 모든 업데이트 실행
    await Promise.all(updatePromises);

    console.log('✅ 모든 병원 데이터 업데이트 완료!');

    // 업데이트 결과 확인
    const updatedHospitals = await prisma.hospital.findMany({
      where: {
        approvalStatusType: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        ranking: true,
        rating: true,
        reviewCount: true,
      },
      orderBy: [{ ranking: 'asc' }, { rating: 'desc' }, { reviewCount: 'desc' }],
      take: 10,
    });

    console.log('\n📈 업데이트 후 상위 10개 병원:');
    updatedHospitals.forEach((hospital, index) => {
      const hospitalName = getHospitalName(hospital.name);

      console.log(
        `  ${index + 1}. ${hospitalName} - ranking: ${hospital.ranking}, rating: ${hospital.rating}, reviewCount: ${hospital.reviewCount}`,
      );
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateHospitalRankingData()
    .then(() => {
      console.log('🎉 스크립트 실행 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateHospitalRankingData };
