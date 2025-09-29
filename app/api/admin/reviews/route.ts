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
      // 성능 최적화: 리뷰 제목/내용 검색 제외, 핵심 필드만 검색
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
        // 고민부위 검색 (string 필드)
        {
          concerns: {
            contains: search,
            mode: 'insensitive',
          },
        },
        // 고민부위 다국어 검색 (한국어만)
        {
          concernsMultilingual: {
            path: ['ko_KR'],
            string_contains: search,
          },
        },
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

    // 성능 최적화: 병렬 쿼리 실행
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        select: {
          // 필요한 필드만 선택 (성능 최적화)
          id: true,
          rating: true,
          concerns: true,
          concernsMultilingual: true,
          isRecommended: true,
          createdAt: true,
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
          _count: {
            select: {
              reviewImages: true,
            },
          },
          // reviewImages는 목록에서 제거 (성능 최적화)
          // 상세 조회 시에만 필요
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' }, // 정렬 안정성 보장
        ],
        skip,
        take: limit,
      }),
    ]);

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
