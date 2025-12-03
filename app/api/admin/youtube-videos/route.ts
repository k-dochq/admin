import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  GetYoutubeVideosResponse,
  CreateYoutubeVideoRequest,
} from '@/features/youtube-video-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId') || undefined;
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.YoutubeVideoWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 커넥션 부족 방지: 순차 쿼리 실행
    const total = await prisma.youtubeVideo.count({ where });
    const videos = await prisma.youtubeVideo.findMany({
      where,
      select: {
        id: true,
        categoryId: true,
        title: true,
        description: true,
        videoUrl: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        thumbnails: {
          select: {
            id: true,
            locale: true,
            imageUrl: true,
            alt: true,
          },
          orderBy: { locale: 'asc' },
        },
        _count: {
          select: {
            thumbnails: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    });

    const response: GetYoutubeVideosResponse = {
      videos,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching youtube videos:', error);
    return NextResponse.json({ error: 'Failed to fetch youtube videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateYoutubeVideoRequest = await request.json();

    // 카테고리 존재 확인
    const category = await prisma.youtubeVideoCategory.findUnique({
      where: { id: body.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Youtube video category not found' }, { status: 400 });
    }

    // 영상 생성
    const video = await prisma.youtubeVideo.create({
      data: {
        categoryId: body.categoryId,
        title: body.title as Prisma.InputJsonValue,
        description: body.description
          ? (body.description as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        videoUrl: body.videoUrl as Prisma.InputJsonValue,
        order: body.order || null,
        isActive: body.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        thumbnails: true,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error creating youtube video:', error);
    return NextResponse.json({ error: 'Failed to create youtube video' }, { status: 500 });
  }
}
