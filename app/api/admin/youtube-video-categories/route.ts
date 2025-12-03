import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  GetYoutubeVideoCategoriesResponse,
  CreateYoutubeVideoCategoryRequest,
} from '@/features/youtube-video-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const where: Prisma.YoutubeVideoCategoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const categories = await prisma.youtubeVideoCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const response: GetYoutubeVideoCategoriesResponse = {
      categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching youtube video categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch youtube video categories' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateYoutubeVideoCategoryRequest = await request.json();

    // 카테고리 생성
    const category = await prisma.youtubeVideoCategory.create({
      data: {
        name: body.name as Prisma.InputJsonValue,
        description: body.description
          ? (body.description as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        order: body.order || null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating youtube video category:', error);
    return NextResponse.json({ error: 'Failed to create youtube video category' }, { status: 500 });
  }
}
