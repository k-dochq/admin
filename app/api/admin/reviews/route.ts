import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { GetReviewsResponse } from '@/features/review-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const medicalSpecialtyId = searchParams.get('medicalSpecialtyId') || undefined;
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;
    const isRecommended =
      searchParams.get('isRecommended') === 'true'
        ? true
        : searchParams.get('isRecommended') === 'false'
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: Prisma.ReviewWhereInput = {};

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          hospital: {
            name: {
              path: ['ko_KR'],
              string_contains: search,
            },
          },
        },
        {
          concerns: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (medicalSpecialtyId) {
      where.medicalSpecialtyId = medicalSpecialtyId;
    }

    if (rating !== undefined) {
      where.rating = rating;
    }

    if (isRecommended !== undefined) {
      where.isRecommended = isRecommended;
    }

    // 총 개수 조회
    const total = await prisma.review.count({ where });

    // 리뷰 목록 조회
    const reviews = await prisma.review.findMany({
      where,
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
          select: {
            id: true,
            imageType: true,
            imageUrl: true,
            order: true,
          },
          orderBy: [{ imageType: 'asc' }, { order: 'asc' }],
        },
        _count: {
          select: {
            reviewImages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const response: GetReviewsResponse = {
      reviews,
      total,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
