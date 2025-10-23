import { NextRequest, NextResponse } from 'next/server';
import { BannerImageRepository } from '@/features/banner-management/api';
import { deleteBannerImageClient } from '@/shared/lib/supabase-client';

const bannerImageRepository = new BannerImageRepository();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id: bannerId, imageId } = await params;

    // 먼저 이미지 정보를 가져와서 Storage 경로를 확인
    const image = await bannerImageRepository.findByBannerIdAndLocale(bannerId, 'ko'); // 임시로 ko 사용
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Storage에서 이미지 삭제
    const imageUrl = image.imageUrl;
    const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/kdoc-storage\/(.+)/);
    if (pathMatch) {
      const storagePath = pathMatch[1];
      await deleteBannerImageClient(storagePath);
    }

    // 데이터베이스에서 이미지 삭제
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
