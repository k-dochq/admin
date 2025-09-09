import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  GetHospitalsUseCase,
  HospitalRepository,
  type GetHospitalsRequest,
} from '@/features/hospital-management/api';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';

/**
 * 병원 목록 조회 API Route Handler
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const endpoint = '/api/admin/hospitals';
  const method = 'GET';

  try {
    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const approvalStatus =
      (searchParams.get('approvalStatus') as GetHospitalsRequest['approvalStatus']) || undefined;
    const districtId = searchParams.get('districtId') || undefined;
    const enableJp =
      searchParams.get('enableJp') === 'true'
        ? true
        : searchParams.get('enableJp') === 'false'
          ? false
          : undefined;
    const hasClone =
      searchParams.get('hasClone') === 'true'
        ? true
        : searchParams.get('hasClone') === 'false'
          ? false
          : undefined;

    // Use Case 실행을 위한 의존성 주입
    const hospitalRepository = new HospitalRepository(prisma);
    const getHospitalsUseCase = new GetHospitalsUseCase(hospitalRepository);

    const result = await getHospitalsUseCase.execute({
      page,
      limit,
      search,
      approvalStatus,
      districtId,
      enableJp,
      hasClone,
    });

    return formatSuccessResponse(result, '병원 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('병원 데이터를 불러오는데 실패했습니다.', requestId, 500);
  }
}
