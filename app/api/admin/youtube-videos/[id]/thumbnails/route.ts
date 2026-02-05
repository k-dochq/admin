import { NextRequest, NextResponse } from 'next/server';
import { type YoutubeVideoLocale } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const VALID_YOUTUBE_VIDEO_LOCALES: YoutubeVideoLocale[] = [
  'ko',
  'en',
  'th',
  'zh',
  'ja',
  'hi',
  'tl',
  'ar',
  'ru',
];

// 영상 썸네일 목록 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const thumbnails = await prisma.youtubeVideoThumbnail.findMany({
      where: {
        videoId: id,
      },
      orderBy: { locale: 'asc' },
    });

    return NextResponse.json(thumbnails);
  } catch (error) {
    console.error('Error fetching youtube video thumbnails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch youtube video thumbnails' },
      { status: 500 },
    );
  }
}

// 영상 썸네일 추가
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imageUrl, locale, alt } = body;

    if (
      !locale ||
      typeof locale !== 'string' ||
      !VALID_YOUTUBE_VIDEO_LOCALES.includes(locale as YoutubeVideoLocale)
    ) {
      return NextResponse.json({ error: 'Valid locale is required' }, { status: 400 });
    }

    const validLocale = locale as YoutubeVideoLocale;

    // 영상 존재 확인
    const video = await prisma.youtubeVideo.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json({ error: 'Youtube video not found' }, { status: 404 });
    }

    // 이미 해당 locale의 썸네일이 있는지 확인
    const existingThumbnail = await prisma.youtubeVideoThumbnail.findUnique({
      where: {
        videoId_locale: {
          videoId: id,
          locale: validLocale,
        },
      },
    });

    let thumbnail;
    if (existingThumbnail) {
      // 업데이트
      thumbnail = await prisma.youtubeVideoThumbnail.update({
        where: { id: existingThumbnail.id },
        data: {
          imageUrl,
          alt: alt || null,
        },
      });
    } else {
      // 생성
      thumbnail = await prisma.youtubeVideoThumbnail.create({
        data: {
          videoId: id,
          locale: validLocale,
          imageUrl,
          alt: alt || null,
        },
      });
    }

    return NextResponse.json(thumbnail);
  } catch (error) {
    console.error('Error creating/updating youtube video thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to create/update youtube video thumbnail' },
      { status: 500 },
    );
  }
}
