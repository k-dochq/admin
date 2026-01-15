import { NextRequest, NextResponse } from 'next/server';
import { generateNickname } from '@/scripts/nickname-generator';
import { prisma } from '@/lib/prisma';

/**
 * 시스템 생성 사용자를 위한 이메일 생성 API
 * @example.com 도메인을 사용하며, 닉네임 생성 로직을 재활용합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 닉네임 생성 로직 재활용
    const nicknameResult = await generateNickname({
      style: 'pascal',
      suffix: 'tag2',
      maxLength: 20,
      seed: crypto.randomUUID(), // 매번 다른 이메일 생성
      avoidAmbiguous: true,
      isTaken: async (canon) => {
        // 이메일 중복 체크
        const email = `${canon.toLowerCase()}@example.com`;
        const existing = await prisma.user.findFirst({
          where: { email },
        });
        return !!existing;
      },
      maxAttempts: 10,
    });

    // 소문자로 변환하고 @example.com 도메인 추가
    const email = `${nicknameResult.display.toLowerCase()}@example.com`;

    return NextResponse.json({ email });
  } catch (error) {
    console.error('이메일 생성 실패:', error);
    return NextResponse.json({ error: '이메일 생성에 실패했습니다.' }, { status: 500 });
  }
}
