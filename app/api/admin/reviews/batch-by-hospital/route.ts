import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BatchUpdateReviewsByHospitalRequest } from '@/features/review-management/api/entities/types';

export async function POST(request: NextRequest) {
  try {
    const body: BatchUpdateReviewsByHospitalRequest = await request.json();

    // 요청 데이터 검증
    if (!body.hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 });
    }

    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive is required and must be a boolean' },
        { status: 400 },
      );
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: body.hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    // 트랜잭션으로 병원의 모든 리뷰 일괄 업데이트
    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.review.updateMany({
        where: {
          hospitalId: body.hospitalId,
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
      hospitalId: body.hospitalId,
    });
  } catch (error) {
    console.error('Error batch updating reviews by hospital:', error);
    return NextResponse.json(
      { error: 'Failed to batch update reviews by hospital' },
      { status: 500 },
    );
  }
}
