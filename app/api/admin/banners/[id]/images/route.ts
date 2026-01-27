import { NextRequest, NextResponse } from 'next/server';
import { BannerImageRepository, VALID_EVENT_BANNER_LOCALES } from '@/features/banner-management/api';
import { type EventBannerLocale } from '@prisma/client';

const bannerImageRepository = new BannerImageRepository();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: bannerId } = await params;

    const images = await bannerImageRepository.findByBannerId(bannerId);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching banner images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch banner images' },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: bannerId } = await params;
    const body = await request.json();

    const { imageUrl, locale, alt } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    if (!locale || !VALID_EVENT_BANNER_LOCALES.includes(locale as EventBannerLocale)) {
      return NextResponse.json({ error: 'Valid locale is required' }, { status: 400 });
    }

    // DB에 이미지 정보 저장 (upsert)
    const result = await bannerImageRepository.upsert({
      bannerId,
      locale: locale as EventBannerLocale,
      imageUrl,
      alt: alt || undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving banner image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save banner image' },
      { status: 400 },
    );
  }
}
