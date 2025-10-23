import { NextRequest, NextResponse } from 'next/server';
import { BannerImageRepository } from '@/features/banner-management/api';

const bannerImageRepository = new BannerImageRepository();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { imageId } = await params;

    // 데이터베이스에서 이미지 삭제만 수행
    // (클라이언트에서 이미 Storage 삭제를 완료했음)
    await bannerImageRepository.delete(imageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete banner image' },
      { status: 400 },
    );
  }
}
