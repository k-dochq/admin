import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { GetReviewsResponse } from '@/features/review-management/api/entities/types';

export async function GET(request: NextRequest) {
  const startMs = Date.now();
  const requestId =
    request.headers.get('x-vercel-id') ||
    request.headers.get('x-request-id') ||
    globalThis.crypto?.randomUUID?.() ||
    `admin-reviews-${startMs}`;

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
    const userType = searchParams.get('userType') || undefined;

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

    // 사용자 타입 필터 (실제 사용자 / 관리자 생성)
    if (userType === 'admin') {
      // 관리자 생성 후기: 이메일이 @example.com 또는 @dummy.com인 경우
      where.user = {
        OR: [{ email: { endsWith: '@example.com' } }, { email: { endsWith: '@dummy.com' } }],
      };
    } else if (userType === 'real') {
      // 실제 사용자 후기: 이메일이 @example.com, @dummy.com이 아닌 경우
      where.user = {
        AND: [
          { email: { not: { endsWith: '@example.com' } } },
          { email: { not: { endsWith: '@dummy.com' } } },
        ],
      };
    }

    // COUNT 쿼리 제거: limit+1로 다음 페이지 존재 여부만 판단
    const reviewsPlusOne = await prisma.review.findMany({
      where,
      select: {
        // 리스트 화면에서 실제로 필요한 필드만 선택 (쿼리/응답 비용 절감)
        id: true,
        rating: true,
        isRecommended: true,
        isActive: true,
        userId: true,
        hospitalId: true,
        createdAt: true,
        medicalSpecialtyId: true,
        concernsMultilingual: true,
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
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }, // 정렬 안정성 보장
      ],
      skip,
      take: limit + 1,
    });

    const hasNextPage = reviewsPlusOne.length > limit;
    const reviews = hasNextPage ? reviewsPlusOne.slice(0, limit) : reviewsPlusOne;
    const hasPrevPage = page > 1;

    const response: GetReviewsResponse = {
      reviews,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    };

    const durationMs = Date.now() - startMs;
    console.info('[admin][reviews][GET] done', {
      requestId,
      durationMs,
      page,
      limit,
      search: search ? '[provided]' : undefined,
      hospitalId,
      medicalSpecialtyId,
      rating,
      isRecommended,
      userType,
      resultCount: reviews.length,
      hasNextPage,
      hasPrevPage,
    });

    return NextResponse.json(response);
  } catch (error) {
    const durationMs = Date.now() - startMs;
    console.error('[admin][reviews][GET] error', { requestId, durationMs, error });
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
