import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  GetHospitalByIdUseCase,
  UpdateHospitalUseCase,
  HospitalEditRepository,
  deleteHospital,
} from '@/features/hospital-edit/api';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';

/**
 * 병원 상세 조회 API Route Handler
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const endpoint = `/api/admin/hospitals/${id}`;
  const method = 'GET';

  try {
    const hospitalEditRepository = new HospitalEditRepository(prisma);
    const getHospitalByIdUseCase = new GetHospitalByIdUseCase(hospitalEditRepository);

    const result = await getHospitalByIdUseCase.execute({ id });

    return formatSuccessResponse(result, '병원 정보를 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    if ((error as Error).message === 'Hospital not found') {
      return formatErrorResponse('병원을 찾을 수 없습니다.', requestId, 404);
    }

    return formatErrorResponse('병원 정보를 불러오는데 실패했습니다.', requestId, 500);
  }
}

/**
 * 병원 정보 수정 API Route Handler
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const endpoint = `/api/admin/hospitals/${id}`;
  const method = 'PUT';

  try {
    const body = await request.json();

    const hospitalEditRepository = new HospitalEditRepository(prisma);
    const updateHospitalUseCase = new UpdateHospitalUseCase(hospitalEditRepository);

    const result = await updateHospitalUseCase.execute({
      id,
      ...body,
    });

    return formatSuccessResponse(result, '병원 정보를 성공적으로 수정했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    if ((error as Error).message === 'Hospital not found') {
      return formatErrorResponse('병원을 찾을 수 없습니다.', requestId, 404);
    }

    return formatErrorResponse('병원 정보를 수정하는데 실패했습니다.', requestId, 500);
  }
}

/**
 * 병원 삭제 API Route Handler
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const endpoint = `/api/admin/hospitals/${id}`;
  const method = 'DELETE';

  try {
    const result = await deleteHospital({ id });

    return formatSuccessResponse(result, '병원이 성공적으로 삭제되었습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    if ((error as Error).message === '삭제할 병원을 찾을 수 없습니다.') {
      return formatErrorResponse('삭제할 병원을 찾을 수 없습니다.', requestId, 404);
    }

    return formatErrorResponse('병원 삭제에 실패했습니다.', requestId, 500);
  }
}
