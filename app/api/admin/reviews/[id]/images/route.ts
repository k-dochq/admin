import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 리뷰 이미지 목록 조회
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const images = await prisma.reviewImage.findMany({
      where: {
        reviewId: id,
        isActive: true,
      },
      orderBy: [{ imageType: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching review images:', error);
    return NextResponse.json({ error: 'Failed to fetch review images' }, { status: 500 });
  }
}

// 리뷰 이미지 추가
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imageType, imageUrl } = body;

    // 리뷰 존재 확인
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 이미지 생성
    const image = await prisma.reviewImage.create({
      data: {
        reviewId: id,
        imageType,
        imageUrl,
        alt: null,
        order: null,
        isActive: true,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error creating review image:', error);
    return NextResponse.json({ error: 'Failed to create review image' }, { status: 500 });
  }
}
