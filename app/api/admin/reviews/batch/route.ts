import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BatchUpdateReviewsRequest } from '@/features/review-management/api/entities/types';

export async function POST(request: NextRequest) {
  try {
    const body: BatchUpdateReviewsRequest = await request.json();

    // 요청 데이터 검증
    if (!body.reviewIds || !Array.isArray(body.reviewIds) || body.reviewIds.length === 0) {
      return NextResponse.json(
        { error: 'reviewIds is required and must be a non-empty array' },
        { status: 400 },
      );
    }

    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive is required and must be a boolean' },
        { status: 400 },
      );
    }

    // 트랜잭션으로 일괄 업데이트
    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.review.updateMany({
        where: {
          id: {
            in: body.reviewIds,
          },
        },
        data: {
          isActive: body.isActive,
          updatedAt: new Date(),
        },
      });

      return updateResult;
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error batch updating reviews:', error);
    return NextResponse.json({ error: 'Failed to batch update reviews' }, { status: 500 });
  }
}
