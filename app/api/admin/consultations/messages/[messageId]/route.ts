import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    messageId: string;
  }>;
}

// PATCH: 메시지 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { content, hospitalId, userId } = await request.json();
    const { messageId } = await params;

    console.log(
      '🔍 PATCH request - messageId:',
      messageId,
      'hospitalId:',
      hospitalId,
      'userId:',
      userId,
    );

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }

    // 메시지 존재 여부 및 관리자 메시지인지 확인
    // hospitalId와 userId가 제공되면 함께 확인
    const whereClause =
      hospitalId && userId
        ? {
            id: messageId,
            hospitalId,
            userId,
          }
        : { id: messageId };

    const existingMessage = await prisma.consultationMessage.findFirst({
      where: whereClause,
    });

    console.log('📋 Found message:', existingMessage ? 'Yes' : 'No');
    if (existingMessage) {
      console.log('📋 Message details:', {
        id: existingMessage.id,
        senderType: existingMessage.senderType,
        hospitalId: existingMessage.hospitalId,
        userId: existingMessage.userId,
      });
    } else {
      // 디버깅: 해당 hospitalId와 userId로 메시지가 있는지 확인
      if (hospitalId && userId) {
        const recentMessages = await prisma.consultationMessage.findMany({
          where: { hospitalId, userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, senderType: true, createdAt: true },
        });
        console.log('📋 Recent messages for this room:', recentMessages);
      }
    }

    if (!existingMessage) {
      return NextResponse.json(
        { success: false, error: `Message not found with ID: ${messageId}` },
        { status: 404 },
      );
    }

    if (existingMessage.senderType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Can only edit admin messages' },
        { status: 403 },
      );
    }

    // 메시지 수정
    const updatedMessage = await prisma.consultationMessage.update({
      where: { id: messageId },
      data: { content },
    });

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 },
    );
  }
}

// DELETE: 메시지 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { messageId } = await params;
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const userId = searchParams.get('userId');

    console.log(
      '🔍 DELETE request - messageId:',
      messageId,
      'hospitalId:',
      hospitalId,
      'userId:',
      userId,
    );

    // 메시지 존재 여부 및 관리자 메시지인지 확인
    // hospitalId와 userId가 제공되면 함께 확인
    const whereClause =
      hospitalId && userId
        ? {
            id: messageId,
            hospitalId,
            userId,
          }
        : { id: messageId };

    const existingMessage = await prisma.consultationMessage.findFirst({
      where: whereClause,
    });

    console.log('📋 Found message:', existingMessage ? 'Yes' : 'No');

    if (!existingMessage) {
      return NextResponse.json(
        { success: false, error: `Message not found with ID: ${messageId}` },
        { status: 404 },
      );
    }

    if (existingMessage.senderType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Can only delete admin messages' },
        { status: 403 },
      );
    }

    // Hard Delete
    await prisma.consultationMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      data: { id: messageId },
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 },
    );
  }
}
