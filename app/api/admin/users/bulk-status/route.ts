import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserStatusType } from '@/lib/types/user';

// 사용자 상태 일괄 변경
export async function PUT(request: NextRequest) {
  try {
    const { userIds, userStatusType } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: '사용자 ID 목록이 필요합니다.' }, { status: 400 });
    }

    if (!userStatusType || !Object.values(UserStatusType).includes(userStatusType)) {
      return NextResponse.json({ error: '유효한 사용자 상태가 필요합니다.' }, { status: 400 });
    }

    // 사용자 존재 확인
    const existingUsers = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: { id: true },
    });

    if (existingUsers.length !== userIds.length) {
      return NextResponse.json({ error: '일부 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 일괄 상태 변경
    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        userStatusType,
        updatedAt: new Date(),
        ...(userStatusType === 'DELETED' && { deleted_at: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${userIds.length}명의 사용자 상태가 변경되었습니다.`,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: '사용자 상태 변경에 실패했습니다.' }, { status: 500 });
  }
}
