import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  type ConsultationMemoResponse,
  type UpdateConsultationMemoRequest,
  type ToggleMemoPinRequest,
  type ToggleMemoCompleteRequest,
} from '@/features/consultation-memo/api/entities/types';

// PUT: 메모 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body: UpdateConsultationMemoRequest = await request.json();
    const { content, isPinned, isCompleted } = body;

    // 최소 하나의 필드는 업데이트되어야 함
    if (content === undefined && isPinned === undefined && isCompleted === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one field (content, isPinned, or isCompleted) is required',
        } as ConsultationMemoResponse,
        { status: 400 },
      );
    }

    const updateData: {
      content?: string;
      isPinned?: boolean | null;
      isCompleted?: boolean | null;
    } = {};

    if (content !== undefined) {
      updateData.content = content;
    }
    if (isPinned !== undefined) {
      updateData.isPinned = isPinned;
    }
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
    }

    const memo = await prisma.consultationMemo.update({
      where: {
        id,
      },
      data: updateData,
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
    if (memo.createdBy) {
      creator = await prisma.user.findUnique({
        where: { id: memo.createdBy },
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
    console.error('Error updating consultation memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update memo',
      } as ConsultationMemoResponse,
      { status: 500 },
    );
  }
}

// PATCH: 메모 상단 고정/완료 처리 토글
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: 'togglePin' | 'toggleComplete' };

    if (!action || (action !== 'togglePin' && action !== 'toggleComplete')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "togglePin" or "toggleComplete"',
        } as ConsultationMemoResponse,
        { status: 400 },
      );
    }

    // 현재 메모 상태 조회
    // Prisma 타입이 재생성되면 타입 에러가 해결됩니다
    const currentMemo = await prisma.consultationMemo.findUnique({
      where: { id },
      select: {
        id: true,
        isPinned: true,
        isCompleted: true,
      } as {
        id: true;
        isPinned: true;
        isCompleted: true;
      },
    });

    if (!currentMemo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Memo not found',
        } as ConsultationMemoResponse,
        { status: 404 },
      );
    }

    // 토글할 필드 결정
    const updateData: {
      isPinned?: boolean | null;
      isCompleted?: boolean | null;
    } = {};

    const typedMemo = currentMemo as { isPinned?: boolean | null; isCompleted?: boolean | null };
    if (action === 'togglePin') {
      updateData.isPinned = typedMemo.isPinned ? null : true;
    } else if (action === 'toggleComplete') {
      updateData.isCompleted = typedMemo.isCompleted ? null : true;
    }

    const memo = await prisma.consultationMemo.update({
      where: { id },
      data: updateData,
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
    if (memo.createdBy) {
      creator = await prisma.user.findUnique({
        where: { id: memo.createdBy },
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
    console.error('Error toggling consultation memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle memo',
      } as ConsultationMemoResponse,
      { status: 500 },
    );
  }
}

// DELETE: 메모 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    await prisma.consultationMemo.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting consultation memo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete memo',
      },
      { status: 500 },
    );
  }
}
