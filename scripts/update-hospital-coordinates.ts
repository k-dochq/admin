import { PrismaClient } from '@prisma/client';
import hospitalCoordinates from './hospital-coordinates.json';

const prisma = new PrismaClient();

interface HospitalCoordinate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

async function updateHospitalCoordinates() {
  console.log('병원 위도/경도 정보 업데이트 시작...');

  let successCount = 0;
  let errorCount = 0;

  for (const hospital of hospitalCoordinates as HospitalCoordinate[]) {
    try {
      await prisma.hospital.update({
        where: { id: hospital.id },
        data: {
          latitude: hospital.latitude,
          longitude: hospital.longitude,
        },
      });

      console.log(`✅ ${hospital.name} - 위도: ${hospital.latitude}, 경도: ${hospital.longitude}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${hospital.name} 업데이트 실패:`, error);
      errorCount++;
    }
  }

  console.log(`\n업데이트 완료!`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${errorCount}개`);
}

updateHospitalCoordinates()
  .catch((error) => {
    console.error('스크립트 실행 중 오류 발생:', error);
  })
  .finally(() => {
    prisma.$disconnect();
  });
