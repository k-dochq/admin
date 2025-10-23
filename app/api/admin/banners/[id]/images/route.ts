import { NextRequest, NextResponse } from 'next/server';
import { BannerImageRepository } from '@/features/banner-management/api';
import { type EventBannerLocale } from '@prisma/client';
import { uploadBannerImageClient } from '@/shared/lib/supabase-client';

const bannerImageRepository = new BannerImageRepository();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: bannerId } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const locale = formData.get('locale') as EventBannerLocale;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!locale || !['ko', 'en', 'th'].includes(locale)) {
      return NextResponse.json({ error: 'Valid locale is required' }, { status: 400 });
    }

    // Supabase Storage에 파일 업로드
    const uploadResult = await uploadBannerImageClient({
      file,
      bannerId,
      locale,
    });

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 });
    }

    const result = await bannerImageRepository.upsert({
      bannerId,
      locale,
      imageUrl: uploadResult.imageUrl!,
      alt: file.name,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload banner image' },
      { status: 400 },
    );
  }
}
