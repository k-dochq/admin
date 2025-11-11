import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  GetReservationsUseCase,
  ReservationRepository,
} from '@/features/reservation-management/api';
import { routeErrorLogger, formatSuccessResponse, formatErrorResponse } from 'shared/lib';
import { ReservationStatus } from '@prisma/client';

/**
 * 예약 목록 조회 API Route Handler
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const endpoint = '/api/admin/reservations';
  const method = 'GET';

  try {
    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as ReservationStatus | null;
    const hospitalId = searchParams.get('hospitalId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    // Use Case 실행을 위한 의존성 주입
    const reservationRepository = new ReservationRepository(prisma);
    const getReservationsUseCase = new GetReservationsUseCase(reservationRepository);

    const result = await getReservationsUseCase.execute({
      page,
      limit,
      search,
      status: status || undefined,
      hospitalId,
      userId,
      dateFrom,
      dateTo,
    });

    return formatSuccessResponse(result, '예약 목록을 성공적으로 조회했습니다.');
  } catch (error) {
    const requestId = routeErrorLogger.logError({
      error: error as Error,
      endpoint,
      method,
      request,
    });

    return formatErrorResponse('예약 데이터를 불러오는데 실패했습니다.', requestId, 500);
  }
}
