import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 생생후기 이미지 목록 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const images = await prisma.liveReviewImage.findMany({
      where: {
        liveReviewId: id,
        isActive: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching live review images:', error);
    return NextResponse.json({ error: 'Failed to fetch live review images' }, { status: 500 });
  }
}

// 생생후기 이미지 추가
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imageUrl, order } = body;

    // 생생후기 존재 확인
    const liveReview = await prisma.liveReview.findUnique({
      where: { id },
    });

    if (!liveReview) {
      return NextResponse.json({ error: 'Live review not found' }, { status: 404 });
    }

    // 이미지 생성
    const image = await prisma.liveReviewImage.create({
      data: {
        liveReviewId: id,
        imageUrl,
        alt: null,
        order: order || null,
        isActive: true,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error creating live review image:', error);
    return NextResponse.json({ error: 'Failed to create live review image' }, { status: 500 });
  }
}
