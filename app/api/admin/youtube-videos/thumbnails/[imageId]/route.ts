import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    const { imageId } = await params;

    // 썸네일 존재 확인
    const existingThumbnail = await prisma.youtubeVideoThumbnail.findUnique({
      where: { id: imageId },
    });

    if (!existingThumbnail) {
      return NextResponse.json({ error: 'Youtube video thumbnail not found' }, { status: 404 });
    }

    // 썸네일 삭제
    await prisma.youtubeVideoThumbnail.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting youtube video thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to delete youtube video thumbnail' },
      { status: 500 },
    );
  }
}
