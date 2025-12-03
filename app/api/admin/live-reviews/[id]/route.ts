import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { UpdateLiveReviewRequest } from '@/features/live-review-management/api/entities/types';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const liveReview = await prisma.liveReview.findUnique({
      where: { id },
      include: {
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
        liveReviewImages: {
          where: {
            isActive: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!liveReview) {
      return NextResponse.json({ error: 'Live review not found' }, { status: 404 });
    }

    return NextResponse.json(liveReview);
  } catch (error) {
    console.error('Error fetching live review:', error);
    return NextResponse.json({ error: 'Failed to fetch live review' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateLiveReviewRequest = await request.json();

    // 생생후기 존재 확인
    const existingLiveReview = await prisma.liveReview.findUnique({
      where: { id },
    });

    if (!existingLiveReview) {
      return NextResponse.json({ error: 'Live review not found' }, { status: 404 });
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

    // 병원 변경 시 존재 확인
    if (body.hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: body.hospitalId },
      });

      if (!hospital) {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 400 });
      }
    }

    // 업데이트 데이터 구성
    const updateData: Prisma.LiveReviewUpdateInput = {
      updatedAt: new Date(),
    };

    if (body.content !== undefined) updateData.content = body.content as Prisma.InputJsonValue;
    if (body.detailLink !== undefined) updateData.detailLink = body.detailLink;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.medicalSpecialtyId) {
      updateData.medicalSpecialty = {
        connect: { id: body.medicalSpecialtyId },
      };
    }
    if (body.hospitalId) {
      updateData.hospital = {
        connect: { id: body.hospitalId },
      };
    }

    // 생생후기 업데이트
    const updatedLiveReview = await prisma.liveReview.update({
      where: { id },
      data: updateData,
      include: {
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
        liveReviewImages: {
          where: {
            isActive: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedLiveReview);
  } catch (error) {
    console.error('Error updating live review:', error);
    return NextResponse.json({ error: 'Failed to update live review' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 생생후기 존재 확인
    const existingLiveReview = await prisma.liveReview.findUnique({
      where: { id },
      include: {
        liveReviewImages: true,
      },
    });

    if (!existingLiveReview) {
      return NextResponse.json({ error: 'Live review not found' }, { status: 404 });
    }

    // 트랜잭션으로 생생후기와 관련 이미지 삭제
    await prisma.$transaction(async (tx) => {
      // 생생후기 이미지 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
      await tx.liveReviewImage.deleteMany({
        where: { liveReviewId: id },
      });

      // 생생후기 삭제
      await tx.liveReview.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting live review:', error);
    return NextResponse.json({ error: 'Failed to delete live review' }, { status: 500 });
  }
}
