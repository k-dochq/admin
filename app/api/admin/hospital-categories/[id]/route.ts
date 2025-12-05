import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';
import type { UpdateHospitalCategoryRequest } from '@/features/hospital-category-management/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const endpoint = '/api/admin/hospital-categories/[id]';
  const method = 'GET';

  try {
    const { id } = await params;

    const category = await prisma.hospitalCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hospitals: true,
          },
        },
      },
    });

    if (!category) {
      return formatErrorResponse('병원 카테고리를 찾을 수 없습니다.', undefined, 404);
    }

    return formatSuccessResponse(category, '병원 카테고리를 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 카테고리 조회에 실패했습니다.', requestId, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const endpoint = '/api/admin/hospital-categories/[id]';
  const method = 'PUT';

  try {
    const { id } = await params;
    const body: UpdateHospitalCategoryRequest = await request.json();

    const existingCategory = await prisma.hospitalCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hospitals: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return formatErrorResponse('병원 카테고리를 찾을 수 없습니다.', undefined, 404);
    }

    const updateData: Prisma.HospitalCategoryUpdateInput = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name as Prisma.InputJsonValue;
    if (body.description !== undefined)
      updateData.description = body.description
        ? (body.description as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedCategory = await prisma.hospitalCategory.update({
      where: { id },
      data: updateData,
    });

    return formatSuccessResponse(updatedCategory, '병원 카테고리를 성공적으로 수정했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 카테고리 수정에 실패했습니다.', requestId, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const endpoint = '/api/admin/hospital-categories/[id]';
  const method = 'DELETE';

  try {
    const { id } = await params;

    const existingCategory = await prisma.hospitalCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hospitals: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return formatErrorResponse('병원 카테고리를 찾을 수 없습니다.', undefined, 404);
    }

    // 연결된 병원이 있으면 soft delete (isActive = false)
    if (existingCategory._count.hospitals > 0) {
      await prisma.hospitalCategory.update({
        where: { id },
        data: { isActive: false },
      });
      return formatSuccessResponse(
        { success: true, message: '연결된 병원이 있어 비활성화 처리했습니다.' },
        '병원 카테고리를 비활성화했습니다.',
      );
    }

    // 연결된 병원이 없으면 hard delete
    await prisma.hospitalCategory.delete({
      where: { id },
    });

    return formatSuccessResponse({ success: true }, '병원 카테고리를 성공적으로 삭제했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 카테고리 삭제에 실패했습니다.', requestId, 500);
  }
}
