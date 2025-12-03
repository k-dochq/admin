import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { UpdateYoutubeVideoRequest } from '@/features/youtube-video-management/api/entities/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const video = await prisma.youtubeVideo.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        thumbnails: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Youtube video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching youtube video:', error);
    return NextResponse.json({ error: 'Failed to fetch youtube video' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateYoutubeVideoRequest = await request.json();

    // 영상 존재 확인
    const existingVideo = await prisma.youtubeVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: 'Youtube video not found' }, { status: 404 });
    }

    // 카테고리 변경 시 존재 확인
    if (body.categoryId) {
      const category = await prisma.youtubeVideoCategory.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return NextResponse.json({ error: 'Youtube video category not found' }, { status: 400 });
      }
    }

    // 업데이트 데이터 구성
    const updateData: Prisma.YoutubeVideoUpdateInput = {
      updatedAt: new Date(),
    };

    if (body.categoryId) {
      updateData.category = {
        connect: { id: body.categoryId },
      };
    }
    if (body.title !== undefined) updateData.title = body.title as Prisma.InputJsonValue;
    if (body.description !== undefined)
      updateData.description = body.description
        ? (body.description as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl as Prisma.InputJsonValue;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // 영상 업데이트
    const updatedVideo = await prisma.youtubeVideo.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        thumbnails: {
          orderBy: { locale: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error updating youtube video:', error);
    return NextResponse.json({ error: 'Failed to update youtube video' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 영상 존재 확인
    const existingVideo = await prisma.youtubeVideo.findUnique({
      where: { id },
      include: {
        thumbnails: true,
      },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: 'Youtube video not found' }, { status: 404 });
    }

    // 트랜잭션으로 영상과 관련 썸네일 삭제
    await prisma.$transaction(async (tx) => {
      // 썸네일 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
      await tx.youtubeVideoThumbnail.deleteMany({
        where: { videoId: id },
      });

      // 영상 삭제
      await tx.youtubeVideo.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting youtube video:', error);
    return NextResponse.json({ error: 'Failed to delete youtube video' }, { status: 500 });
  }
}
