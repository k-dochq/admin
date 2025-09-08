import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: 초대코드 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 초대코드가 사용되었는지 확인
    const invitationCode = await prisma.invitationCode.findUnique({
      where: { id },
      include: {
        UsedBy: true,
      },
    });

    if (!invitationCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invitation code not found',
        },
        { status: 404 },
      );
    }

    if (invitationCode.UsedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete used invitation code',
        },
        { status: 400 },
      );
    }

    // 초대코드 삭제
    await prisma.invitationCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Failed to delete invitation code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete invitation code',
      },
      { status: 500 },
    );
  }
}
