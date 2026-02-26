import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';
import type { UpdateMedicalSpecialtyRequest } from '@/features/medical-specialty-management/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const endpoint = '/api/admin/medical-specialties/[id]';
  const method = 'GET';

  try {
    const { id } = await params;

    const specialty = await prisma.medicalSpecialty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hospitalSpecialties: true,
            doctorSpecialties: true,
          },
        },
      },
    });

    if (!specialty) {
      return formatErrorResponse('진료부위를 찾을 수 없습니다.', undefined, 404);
    }

    return formatSuccessResponse(specialty, '진료부위를 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });
    return formatErrorResponse('진료부위 조회에 실패했습니다.', requestId, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const endpoint = '/api/admin/medical-specialties/[id]';
  const method = 'PUT';

  try {
    const { id } = await params;
    const body: UpdateMedicalSpecialtyRequest = await request.json();

    const existing = await prisma.medicalSpecialty.findUnique({
      where: { id },
    });

    if (!existing) {
      return formatErrorResponse('진료부위를 찾을 수 없습니다.', undefined, 404);
    }

    if (!existing.parentSpecialtyId) {
      return formatErrorResponse('상위 카테고리는 수정할 수 없습니다.', undefined, 403);
    }

    const updateData: Prisma.MedicalSpecialtyUpdateInput = {
      updatedAt: new Date(),
    };
    if (body.name !== undefined) updateData.name = body.name as Prisma.InputJsonValue;
    if (body.description !== undefined)
      updateData.description = body.description
        ? (body.description as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await prisma.medicalSpecialty.update({
      where: { id },
      data: updateData,
    });

    return formatSuccessResponse(updated, '하위 진료부위를 성공적으로 수정했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });
    return formatErrorResponse('하위 진료부위 수정에 실패했습니다.', requestId, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const endpoint = '/api/admin/medical-specialties/[id]';
  const method = 'DELETE';

  try {
    const { id } = await params;

    const existing = await prisma.medicalSpecialty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hospitalSpecialties: true,
            doctorSpecialties: true,
          },
        },
      },
    });

    if (!existing) {
      return formatErrorResponse('진료부위를 찾을 수 없습니다.', undefined, 404);
    }

    if (!existing.parentSpecialtyId) {
      return formatErrorResponse('상위 카테고리는 삭제할 수 없습니다.', undefined, 403);
    }

    const hasAssignments =
      (existing._count?.hospitalSpecialties ?? 0) > 0 ||
      (existing._count?.doctorSpecialties ?? 0) > 0;

    if (hasAssignments) {
      await prisma.medicalSpecialty.update({
        where: { id },
        data: { isActive: false },
      });
      return formatSuccessResponse(
        { success: true, message: '연결된 데이터가 있어 비활성화 처리했습니다.' },
        '진료부위를 비활성화했습니다.',
      );
    }

    await prisma.medicalSpecialty.delete({
      where: { id },
    });

    return formatSuccessResponse({ success: true }, '하위 진료부위를 성공적으로 삭제했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });
    return formatErrorResponse('하위 진료부위 삭제에 실패했습니다.', requestId, 500);
  }
}
