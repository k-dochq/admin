import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 리뷰 이미지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    const { imageId } = await params;

    // 이미지 조회
    const image = await prisma.reviewImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // 이미지 삭제 (soft delete)
    await prisma.reviewImage.update({
      where: { id: imageId },
      data: { isActive: false },
    });

    // 스토리지 경로 반환 (클라이언트에서 스토리지 삭제용)
    const storagePath = image.imageUrl.split('/').slice(-2).join('/'); // 마지막 2개 경로 조합

    return NextResponse.json({
      success: true,
      storagePath,
    });
  } catch (error) {
    console.error('Error deleting review image:', error);
    return NextResponse.json({ error: 'Failed to delete review image' }, { status: 500 });
  }
}
