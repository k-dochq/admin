import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type AdminChatApiResponse } from '@/lib/types/admin-chat';

interface SendMessageRequest {
  hospitalId: string;
  userId: string;
  content: string;
  senderType: 'USER' | 'ADMIN';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SendMessageRequest = await request.json();
    const { hospitalId, userId, content, senderType } = body;

    // 필수 필드 검증
    if (!hospitalId || !userId || !content || !senderType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    // 메시지 길이 검증
    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content cannot be empty' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message content too long' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    // 데이터베이스에 메시지 저장
    const message = await prisma.consultationMessage.create({
      data: {
        hospitalId,
        userId,
        content: content.trim(),
        senderType,
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
    });

    const response: AdminChatApiResponse = {
      success: true,
      data: message,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in admin send message API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as AdminChatApiResponse,
      { status: 500 },
    );
  }
}
