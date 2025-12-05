import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';
import type {
  GetHospitalCategoriesResponse,
  CreateHospitalCategoryRequest,
} from '@/features/hospital-category-management/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const endpoint = '/api/admin/hospital-categories';
  const method = 'GET';

  try {
    const { searchParams } = new URL(request.url);
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;

    const where: Prisma.HospitalCategoryWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const categories = await prisma.hospitalCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            hospitals: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const response: GetHospitalCategoriesResponse = {
      categories,
    };

    return formatSuccessResponse(response, '병원 카테고리 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 카테고리 목록을 불러오는데 실패했습니다.', requestId, 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const endpoint = '/api/admin/hospital-categories';
  const method = 'POST';

  try {
    const body: CreateHospitalCategoryRequest = await request.json();

    const category = await prisma.hospitalCategory.create({
      data: {
        name: body.name as Prisma.InputJsonValue,
        description: body.description
          ? (body.description as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        order: body.order || null,
        isActive: body.isActive ?? true,
      },
    });

    return formatSuccessResponse(category, '병원 카테고리를 성공적으로 생성했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 카테고리 생성에 실패했습니다.', requestId, 500);
  }
}
