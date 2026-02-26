import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';
import type { CreateMedicalSpecialtyRequest } from '@/features/medical-specialty-management/api';

export async function GET(request: NextRequest) {
  const endpoint = '/api/admin/medical-specialties';
  const method = 'GET';

  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const isActive =
      isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const where: Prisma.MedicalSpecialtyWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const medicalSpecialties = await prisma.medicalSpecialty.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return formatSuccessResponse(
      { medicalSpecialties },
      '진료부위 목록을 성공적으로 조회했습니다.',
    );
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });
    return formatErrorResponse('진료부위 목록을 불러오는데 실패했습니다.', requestId, 500);
  }
}

export async function POST(request: NextRequest) {
  const endpoint = '/api/admin/medical-specialties';
  const method = 'POST';

  try {
    const body: CreateMedicalSpecialtyRequest = await request.json();

    if (!body.parentSpecialtyId) {
      return formatErrorResponse('parentSpecialtyId는 필수입니다.', undefined, 400);
    }

    const parent = await prisma.medicalSpecialty.findUnique({
      where: { id: body.parentSpecialtyId },
    });

    if (!parent) {
      return formatErrorResponse('상위 진료부위를 찾을 수 없습니다.', undefined, 404);
    }

    if (parent.parentSpecialtyId) {
      return formatErrorResponse('상위 카테고리 아래에만 하위 카테고리를 추가할 수 있습니다.', undefined, 400);
    }

    const specialty = await prisma.medicalSpecialty.create({
      data: {
        parentSpecialtyId: body.parentSpecialtyId,
        specialtyType: parent.specialtyType,
        name: body.name as Prisma.InputJsonValue,
        description: body.description
          ? (body.description as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        order: body.order ?? null,
        isActive: body.isActive ?? true,
      },
    });

    return formatSuccessResponse(specialty, '하위 진료부위를 성공적으로 추가했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });
    return formatErrorResponse('하위 진료부위 추가에 실패했습니다.', requestId, 500);
  }
}
