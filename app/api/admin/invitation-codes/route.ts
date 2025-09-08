import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvitationCode, calculateExpiresAt } from '@/lib/utils/invitation-code';
import type { CreateInvitationCodeRequest } from '@/lib/types/invitation-code';
import { InvitationCodeKind } from '@/lib/types/common';

// GET: 초대코드 목록 조회
export async function GET() {
  try {
    const invitationCodes = await prisma.invitationCode.findMany({
      include: {
        UsedBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: invitationCodes,
    });
  } catch (error) {
    console.error('Failed to fetch invitation codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invitation codes',
      },
      { status: 500 },
    );
  }
}

// POST: 초대코드 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateInvitationCodeRequest = await request.json();
    const { kind, expiresInDays = 30 } = body;

    // 입력 검증
    if (!kind || !Object.values(InvitationCodeKind).includes(kind)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invitation code kind',
        },
        { status: 400 },
      );
    }

    if (
      kind === InvitationCodeKind.PAYMENT_REFERENCE &&
      (expiresInDays < 1 || expiresInDays > 365)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Expires in days must be between 1 and 365',
        },
        { status: 400 },
      );
    }

    // 초대코드 생성
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // 고유한 코드 생성 (최대 10번 시도)
    do {
      code = generateInvitationCode(kind);
      const existingCode = await prisma.invitationCode.findUnique({
        where: { code },
      });
      isUnique = !existingCode;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate unique code',
        },
        { status: 500 },
      );
    }

    // 만료일 계산
    const expiresAt = calculateExpiresAt(kind, expiresInDays);

    // 초대코드 생성
    const invitationCode = await prisma.invitationCode.create({
      data: {
        code,
        kind,
        expiresAt,
      },
      include: {
        UsedBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: invitationCode,
    });
  } catch (error) {
    console.error('Failed to create invitation code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create invitation code',
      },
      { status: 500 },
    );
  }
}
