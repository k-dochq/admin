import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { GetReviewsResponse } from '@/features/review-management/api/entities/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    // const search = searchParams.get('search') || undefined; // 검색 기능 제거
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

    // 성능 최적화: 모든 검색 기능 제거 (slow 쿼리 방지)
    // - User JOIN 검색 (user.name)
    // - Hospital JOIN + JSON 필드 검색 (hospital.name)
    // - JSON 필드 검색 (concernsMultilingual)
    // - ILIKE 검색 (concerns)
    // 위 기능들은 모두 복잡한 JOIN과 JSON 필드 검색으로 인해 성능 문제를 유발
    // if (search) { ... } // 검색 기능 완전 제거

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
          // 성능 최적화: 핵심 필드만 선택 (JOIN 최소화)
          id: true,
          rating: true,
          title: true,
          content: true,
          isRecommended: true,
          viewCount: true,
          likeCount: true,
          userId: true,
          hospitalId: true,
          createdAt: true,
          updatedAt: true,
          concerns: true,
          medicalSpecialtyId: true,
          commentCount: true,
          // concernsMultilingual 제거 (JSON 필드)
          // user JOIN 제거 (검색 기능 제거로 불필요)
          // hospital JOIN 제거 (검색 기능 제거로 불필요)
          // medicalSpecialty JOIN 제거 (검색 기능 제거로 불필요)
          // reviewImages 제거 (성능 최적화)
          // _count 제거 (성능 최적화)
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
