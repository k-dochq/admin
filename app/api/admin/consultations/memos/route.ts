import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from 'shared/lib/supabase/server-client';
import {
  type ConsultationMemoListResponse,
  type ConsultationMemoResponse,
  type CreateConsultationMemoRequest,
} from '@/features/consultation-memo/api/entities/types';

// GET: 메모 목록 조회
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const userId = searchParams.get('userId');

    if (!hospitalId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'hospitalId and userId are required',
        } as ConsultationMemoListResponse,
        { status: 400 },
      );
    }

    // 해당 병원과 사용자 간의 모든 메모 조회
    // 상단 고정된 메모를 먼저 표시하고, 그 다음 날짜별 내림차순 정렬
    const memos = await prisma.consultationMemo.findMany({
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
        Hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          isPinned: 'desc', // null이 마지막에 오도록 (true가 먼저)
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    // 작성자 정보 조회
    const creatorIds = [
      ...new Set(memos.map((memo) => memo.createdBy).filter(Boolean)),
    ] as string[];
    const creators =
      creatorIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: creatorIds,
              },
            },
            select: {
              id: true,
              email: true,
              name: true,
              displayName: true,
            },
          })
        : [];

    const creatorMap = new Map(creators.map((creator) => [creator.id, creator]));

    // 메모에 작성자 정보 추가
    const memosWithCreators = memos.map((memo) => ({
      ...memo,
      Creator: memo.createdBy ? creatorMap.get(memo.createdBy) || null : null,
    }));

    const response: ConsultationMemoListResponse = {
      success: true,
      data: {
        memos: memosWithCreators,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in consultation memos API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ConsultationMemoListResponse,
      { status: 500 },
    );
  }
}

// POST: 새 메모 생성
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateConsultationMemoRequest = await request.json();
    const { userId, hospitalId, content } = body;

    if (!userId || !hospitalId || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId, hospitalId, and content are required',
        } as ConsultationMemoResponse,
        { status: 400 },
      );
    }

    // 세션에서 현재 사용자 ID 가져오기
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const createdBy = session?.user?.id || null;

    const memo = await prisma.consultationMemo.create({
      data: {
        userId,
        hospitalId,
        content,
        createdBy,
      },
      include: {
        User: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
        },
        Hospital: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 작성자 정보 조회
    let creator = null;
    if (createdBy) {
      creator = await prisma.user.findUnique({
        where: { id: createdBy },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
        },
      });
    }

    const memoWithCreator = {
      ...memo,
      Creator: creator,
    };

    const response: ConsultationMemoResponse = {
      success: true,
      data: memoWithCreator,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating consultation memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create memo',
      } as ConsultationMemoResponse,
      { status: 500 },
    );
  }
}
