import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDistrictDisplayNames() {
  try {
    console.log('🔄 District displayName 초기화를 시작합니다...');

    // 먼저 displayName 컬럼을 JSONB로 변경
    try {
      await prisma.$executeRaw`ALTER TABLE "District" ALTER COLUMN "displayName" TYPE JSONB USING NULL;`;
      console.log('✅ displayName 컬럼이 JSONB로 변경되었습니다.');
    } catch (error) {
      console.log('ℹ️ displayName 컬럼 타입 변경 중 오류 (이미 JSONB일 수 있음):', error);
    }

    // 모든 District의 displayName을 NULL로 초기화
    const result = await prisma.district.updateMany({
      data: {
        displayName: null,
      },
    });

    console.log(`✅ ${result.count}개의 District displayName이 NULL로 초기화되었습니다.`);

    // 확인
    const totalCount = await prisma.district.count();
    const nullCount = await prisma.district.count({
      where: {
        displayName: null,
      },
    });

    console.log(`📊 전체 District: ${totalCount}개`);
    console.log(`📊 displayName이 NULL인 District: ${nullCount}개`);

    if (nullCount === totalCount) {
      console.log('🎉 모든 District의 displayName이 성공적으로 초기화되었습니다!');
    } else {
      console.log('⚠️ 일부 District의 displayName이 초기화되지 않았습니다.');
    }
  } catch (error) {
    console.error('❌ 초기화 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  resetDistrictDisplayNames();
}

export { resetDistrictDisplayNames };
