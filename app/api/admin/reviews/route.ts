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
      // 성능 최적화: 고민부위 검색 제거, 사용자명과 병원명만 검색
      where.OR = [
        // 사용자명 검색 (가장 빠름)
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        // 병원명 검색 (한국어만)
        {
          hospital: {
            name: {
              path: ['ko_KR'],
              string_contains: search,
            },
          },
        },
        // 고민부위 검색 제거 (성능 최적화)
        // - concerns (string 필드)
        // - concernsMultilingual (JSON 필드)
        // 성능 문제로 인해 제목/내용 검색 제거:
        // - title (JSON 필드)
        // - content (JSON 필드)
        // 이 필드들은 매우 느린 검색을 유발하므로 제외
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

    // 커넥션 부족 방지: 순차 쿼리 실행
    // 병렬 실행은 동시에 2개의 커넥션을 사용하므로 순차 실행으로 변경
    const total = await prisma.review.count({ where });
    const reviews = await prisma.review.findMany({
      where,
      select: {
        // ReviewForList 타입에 맞는 모든 필드 선택
        id: true,
        rating: true,
        title: true,
        content: true,
        isRecommended: true,
        isActive: true,
        viewCount: true,
        likeCount: true,
        userId: true,
        hospitalId: true,
        createdAt: true,
        updatedAt: true,
        concerns: true,
        medicalSpecialtyId: true,
        concernsMultilingual: true,
        commentCount: true,
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
          where: {
            isActive: true,
          },
          orderBy: [{ imageType: 'asc' }, { order: 'asc' }],
        },
        _count: {
          select: {
            reviewImages: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }, // 정렬 안정성 보장
      ],
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
