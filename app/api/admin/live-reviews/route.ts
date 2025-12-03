import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { GetLiveReviewsResponse } from '@/features/live-review-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const medicalSpecialtyId = searchParams.get('medicalSpecialtyId') || undefined;
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.LiveReviewWhereInput = {};

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (medicalSpecialtyId) {
      where.medicalSpecialtyId = medicalSpecialtyId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 커넥션 부족 방지: 순차 쿼리 실행
    const total = await prisma.liveReview.count({ where });
    const liveReviews = await prisma.liveReview.findMany({
      where,
      select: {
        id: true,
        content: true,
        hospitalId: true,
        medicalSpecialtyId: true,
        detailLink: true,
        order: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
          select: {
            id: true,
            imageUrl: true,
            order: true,
          },
          where: {
            isActive: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            liveReviewImages: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
        { id: 'desc' }, // 정렬 안정성 보장
      ],
      skip,
      take: limit,
    });

    const response: GetLiveReviewsResponse = {
      liveReviews,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching live reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch live reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 필수 필드 검증
    if (!body.medicalSpecialtyId) {
      return NextResponse.json({ error: '시술부위를 선택해주세요.' }, { status: 400 });
    }

    if (!body.hospitalId) {
      return NextResponse.json({ error: '병원을 선택해주세요.' }, { status: 400 });
    }

    if (!body.content) {
      return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
    }

    // 시술부위 존재 확인
    const medicalSpecialty = await prisma.medicalSpecialty.findUnique({
      where: { id: body.medicalSpecialtyId },
    });

    if (!medicalSpecialty) {
      return NextResponse.json({ error: '시술부위를 찾을 수 없습니다.' }, { status: 400 });
    }

    // 병원 존재 확인
    const hospital = await prisma.hospital.findUnique({
      where: { id: body.hospitalId },
    });

    if (!hospital) {
      return NextResponse.json({ error: '병원을 찾을 수 없습니다.' }, { status: 400 });
    }

    // 생생후기 생성
    const liveReview = await prisma.liveReview.create({
      data: {
        id: crypto.randomUUID(),
        content: body.content as Prisma.InputJsonValue,
        detailLink: body.detailLink || null,
        order: body.order || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        hospitalId: body.hospitalId,
        medicalSpecialtyId: body.medicalSpecialtyId,
      },
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
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(liveReview, { status: 201 });
  } catch (error) {
    console.error('Error creating live review:', error);
    return NextResponse.json({ error: '생생후기 생성에 실패했습니다.' }, { status: 500 });
  }
}
