import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseLocalizedText, getKoreanText } from '@/lib/types/consultation';
import { type AdminChatApiResponse } from '@/lib/types/admin-chat';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const userId = searchParams.get('userId');

    if (!hospitalId || !userId) {
      return NextResponse.json(
        { success: false, error: 'hospitalId and userId are required' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    // 병원 정보 조회
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
      },
    });

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        name: true,
      },
    });

    if (!hospital || !user) {
      return NextResponse.json(
        { success: false, error: 'Hospital or user not found' } as AdminChatApiResponse,
        { status: 404 },
      );
    }

    const response: AdminChatApiResponse = {
      success: true,
      data: {
        hospitalName: getKoreanText(parseLocalizedText(hospital.name)),
        userName: user.displayName || user.name || '사용자',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in admin room info API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as AdminChatApiResponse,
      { status: 500 },
    );
  }
}
