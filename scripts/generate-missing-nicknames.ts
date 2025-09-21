import { PrismaClient } from '@prisma/client';
import { generateNickname } from './nickname-generator.js';

const prisma = new PrismaClient();

async function generateMissingNicknames() {
  console.log('🔍 닉네임이 없는 사용자들을 찾는 중...');

  // nickName이 null이거나 빈 문자열인 사용자들 조회
  const usersWithoutNickname = await prisma.user.findMany({
    where: {
      OR: [{ nickName: null }, { nickName: '' }],
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      name: true,
    },
  });

  console.log(`📊 닉네임이 필요한 사용자 수: ${usersWithoutNickname.length}`);

  if (usersWithoutNickname.length === 0) {
    console.log('✅ 모든 사용자가 이미 닉네임을 가지고 있습니다.');
    return;
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const user of usersWithoutNickname) {
    try {
      console.log(`\n👤 사용자 처리 중: ${user.email} (ID: ${user.id})`);

      // 기존 닉네임이 있는지 다시 한번 확인 (동시성 문제 방지)
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { nickName: true },
      });

      if (existingUser?.nickName && existingUser.nickName.trim() !== '') {
        console.log(`⏭️  이미 닉네임이 있습니다: ${existingUser.nickName}`);
        continue;
      }

      // 닉네임 생성 (영어, PascalCase, 2자리 태그)
      const nicknameResult = await generateNickname({
        style: 'pascal',
        suffix: 'tag2',
        maxLength: 20,
        seed: user.id, // 사용자 ID를 시드로 사용하여 재현 가능하게
        isTaken: async (canon) => {
          // 생성된 닉네임이 이미 사용 중인지 확인
          const existing = await prisma.user.findFirst({
            where: {
              nickName: {
                equals: canon,
                mode: 'insensitive',
              },
            },
          });
          return !!existing;
        },
        maxAttempts: 10,
      });

      // 사용자 정보 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: {
          nickName: nicknameResult.display,
        },
      });

      console.log(`✅ 닉네임 생성 완료: ${nicknameResult.display}`);
      results.success++;
    } catch (error) {
      console.error(`❌ 사용자 ${user.email} 처리 실패:`, error);
      results.failed++;
      results.errors.push(
        `${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // 결과 출력
  console.log('\n📈 처리 결과:');
  console.log(`✅ 성공: ${results.success}명`);
  console.log(`❌ 실패: ${results.failed}명`);

  if (results.errors.length > 0) {
    console.log('\n🚨 에러 목록:');
    results.errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log('\n🎉 닉네임 생성 작업이 완료되었습니다!');
}

async function main() {
  try {
    await generateMissingNicknames();
  } catch (error) {
    console.error('💥 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { generateMissingNicknames };
