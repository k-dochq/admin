import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { UpdateReviewRequest } from '@/features/review-management/api/entities/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalSpecialty: {
          select: {
            id: true,
            name: true,
            specialtyType: true,
          },
        },
        reviewImages: {
          orderBy: [{ imageType: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateReviewRequest = await request.json();

    // 리뷰 존재 확인
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 시술부위 변경 시 존재 확인
    if (body.medicalSpecialtyId) {
      const medicalSpecialty = await prisma.medicalSpecialty.findUnique({
        where: { id: body.medicalSpecialtyId },
      });

      if (!medicalSpecialty) {
        return NextResponse.json({ error: 'Medical specialty not found' }, { status: 400 });
      }
    }

    // 업데이트 데이터 구성
    const updateData: Prisma.ReviewUpdateInput = {
      updatedAt: new Date(),
    };

    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.title !== undefined) updateData.title = body.title as Prisma.InputJsonValue;
    if (body.content !== undefined) updateData.content = body.content as Prisma.InputJsonValue;
    if (body.concerns !== undefined) updateData.concerns = body.concerns;
    if (body.isRecommended !== undefined) updateData.isRecommended = body.isRecommended;
    if (body.medicalSpecialtyId) {
      updateData.medicalSpecialty = {
        connect: { id: body.medicalSpecialtyId },
      };
    }

    // 리뷰 업데이트
    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        medicalSpecialty: {
          select: {
            id: true,
            name: true,
            specialtyType: true,
          },
        },
        reviewImages: {
          orderBy: [{ imageType: 'asc' }, { order: 'asc' }],
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 리뷰 존재 확인
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewImages: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 트랜잭션으로 리뷰와 관련 이미지 삭제
    await prisma.$transaction(async (tx) => {
      // 리뷰 이미지 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
      await tx.reviewImage.deleteMany({
        where: { reviewId: id },
      });

      // 리뷰 삭제
      await tx.review.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
