import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHospitalDisplayLocationNames() {
  try {
    console.log('🚀 Hospital displayLocationName 업데이트를 시작합니다...');

    // District가 연결된 모든 Hospital 조회
    const hospitals = await prisma.hospital.findMany({
      where: {
        districtId: {
          not: null,
        },
      },
      include: {
        district: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`📊 총 ${hospitals.length}개의 병원을 찾았습니다.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const hospital of hospitals) {
      if (!hospital.district) {
        console.log(`⚠️  병원 ${hospital.id}에 district 정보가 없습니다.`);
        skippedCount++;
        continue;
      }

      try {
        // District의 name을 Hospital의 displayLocationName에 복사
        await prisma.hospital.update({
          where: {
            id: hospital.id,
          },
          data: {
            displayLocationName: hospital.district.name as Prisma.InputJsonValue,
          },
        });

        updatedCount++;

        // 진행 상황 표시 (100개마다)
        if (updatedCount % 100 === 0) {
          console.log(`✅ ${updatedCount}개 병원 업데이트 완료...`);
        }
      } catch (error) {
        console.error(`❌ 병원 ${hospital.id} 업데이트 실패:`, error);
        skippedCount++;
      }
    }

    console.log('\n📈 업데이트 완료!');
    console.log(`✅ 성공: ${updatedCount}개`);
    console.log(`⚠️  건너뜀: ${skippedCount}개`);
    console.log(`📊 총 처리: ${updatedCount + skippedCount}개`);

    // 결과 확인을 위한 샘플 조회
    console.log('\n🔍 업데이트 결과 샘플:');
    const sampleHospitals = await prisma.hospital.findMany({
      where: {
        displayLocationName: {
          not: Prisma.JsonNull,
        },
      },
      include: {
        district: {
          select: {
            name: true,
          },
        },
      },
      take: 5,
    });

    sampleHospitals.forEach((hospital, index) => {
      console.log(`${index + 1}. 병원 ID: ${hospital.id}`);
      console.log(`   District name: ${JSON.stringify(hospital.district?.name)}`);
      console.log(`   Display location name: ${JSON.stringify(hospital.displayLocationName)}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류가 발생했습니다:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
updateHospitalDisplayLocationNames()
  .then(() => {
    console.log('🎉 스크립트가 성공적으로 완료되었습니다!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });

export { updateHospitalDisplayLocationNames };
