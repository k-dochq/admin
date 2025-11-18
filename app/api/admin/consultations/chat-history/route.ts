import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type AdminChatApiResponse, type AdminChatHistoryResponse } from '@/lib/types/admin-chat';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const cursor = searchParams.get('cursor'); // ISO string of createdAt

    if (!hospitalId || !userId) {
      return NextResponse.json(
        { success: false, error: 'hospitalId and userId are required' } as AdminChatApiResponse,
        { status: 400 },
      );
    }

    // 페이지네이션: 최신순으로 limit+1 조회 후 hasMore 판정, 응답은 ASC로 반환
    const limit = (() => {
      const n = parseInt(limitParam || '50', 10);
      if (Number.isNaN(n)) return 50;
      return Math.min(Math.max(n, 1), 100);
    })();

    const baseWhere = {
      hospitalId,
      userId,
      ...(cursor
        ? {
            createdAt: {
              lt: new Date(cursor),
            },
          }
        : {}),
    } as const;

    const items = await prisma.consultationMessage.findMany({
      where: baseWhere,
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
        createdAt: 'desc',
      },
      take: limit + 1, // hasMore 판단을 위해 한 개 더 요청
    });

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, -1) : items;
    // 화면 렌더 편의상 오래된→최신 순으로 반환
    const messages = sliced.reverse();
    const nextCursor = hasMore ? messages[0]?.createdAt?.toISOString() : null;

    const response: AdminChatApiResponse<AdminChatHistoryResponse> = {
      success: true,
      data: {
        messages,
        hasMore,
        nextCursor,
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
