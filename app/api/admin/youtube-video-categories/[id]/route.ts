import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { UpdateYoutubeVideoCategoryRequest } from '@/features/youtube-video-management/api/entities/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const category = await prisma.youtubeVideoCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Youtube video category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching youtube video category:', error);
    return NextResponse.json({ error: 'Failed to fetch youtube video category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateYoutubeVideoCategoryRequest = await request.json();

    // 카테고리 존재 확인
    const existingCategory = await prisma.youtubeVideoCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Youtube video category not found' }, { status: 404 });
    }

    // 업데이트 데이터 구성
    const updateData: Prisma.YoutubeVideoCategoryUpdateInput = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name as Prisma.InputJsonValue;
    if (body.description !== undefined)
      updateData.description = body.description
        ? (body.description as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // 카테고리 업데이트
    const updatedCategory = await prisma.youtubeVideoCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating youtube video category:', error);
    return NextResponse.json({ error: 'Failed to update youtube video category' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 카테고리 존재 확인
    const existingCategory = await prisma.youtubeVideoCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Youtube video category not found' }, { status: 404 });
    }

    // 연결된 영상이 있으면 삭제 불가
    if (existingCategory._count.videos > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated videos' },
        { status: 400 },
      );
    }

    // 카테고리 삭제
    await prisma.youtubeVideoCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting youtube video category:', error);
    return NextResponse.json({ error: 'Failed to delete youtube video category' }, { status: 500 });
  }
}
