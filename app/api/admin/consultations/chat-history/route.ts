import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type AdminChatApiResponse, type AdminChatHistoryResponse } from '@/lib/types/admin-chat';

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

    // 해당 병원과 사용자 간의 모든 메시지 조회
    const messages = await prisma.consultationMessage.findMany({
      where: {
        hospitalId,
        userId,
      },
      include: {
        User: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const response: AdminChatApiResponse<AdminChatHistoryResponse> = {
      success: true,
      data: {
        messages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in admin chat history API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as AdminChatApiResponse,
      { status: 500 },
    );
  }
}
