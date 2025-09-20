import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateUserRequest } from '@/lib/types/user';

// 사용자 상세 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        UserRole: {
          include: {
            AdminRole: true,
          },
        },
        invitationCode: true,
        _count: {
          select: {
            reviews: true,
            comments: true,
            HospitalLike: true,
            ReviewLike: true,
            consultationMessages: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: '사용자 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

// 사용자 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data: UpdateUserRequest = await request.json();

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이메일 중복 확인 (다른 사용자가 사용 중인지)
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 });
      }
    }

    // 전화번호 중복 확인 (다른 사용자가 사용 중인지)
    if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
      const phoneExists = await prisma.user.findFirst({
        where: { phoneNumber: data.phoneNumber },
      });

      if (phoneExists) {
        return NextResponse.json({ error: '이미 사용 중인 전화번호입니다.' }, { status: 400 });
      }
    }

    // 사용자 수정
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        UserRole: {
          include: {
            AdminRole: true,
          },
        },
        invitationCode: true,
        _count: {
          select: {
            reviews: true,
            comments: true,
            HospitalLike: true,
            ReviewLike: true,
            consultationMessages: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: '사용자 수정에 실패했습니다.' }, { status: 500 });
  }
}

// 사용자 삭제 (소프트 삭제)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 소프트 삭제 (userStatusType을 DELETED로 변경)
    await prisma.user.update({
      where: { id },
      data: {
        userStatusType: 'DELETED',
        deleted_at: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: '사용자 삭제에 실패했습니다.' }, { status: 500 });
  }
}
