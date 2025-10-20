import { NextRequest, NextResponse } from 'next/server';
import { createReservation } from '@/features/reservation-management/api/use-cases/create-reservation-use-case';
import {
  type CreateReservationRequest,
  type CreateReservationResponse,
} from '@/features/reservation-management/api/entities/types';

/**
 * 예약 생성 API Route
 * POST /api/admin/reservations/create
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateReservationResponse>> {
  const endpoint = '/api/admin/reservations/create';
  const method = 'POST';

  try {
    console.log(`[${new Date().toISOString()}] ${method} ${endpoint} 요청 시작`);

    // 요청 본문 파싱
    const body: CreateReservationRequest = await request.json();
    console.log(`[${new Date().toISOString()}] 요청 데이터:`, body);

    // 필수 필드 검증
    if (!body.hospitalId || !body.userId) {
      console.error(
        `[${new Date().toISOString()}] 필수 필드 누락: hospitalId=${body.hospitalId}, userId=${body.userId}`,
      );
      return NextResponse.json(
        {
          success: false,
          error: '병원 ID와 사용자 ID는 필수입니다.',
        } as CreateReservationResponse,
        { status: 400 },
      );
    }

    // 예약 생성 Use Case 실행
    const result = await createReservation(body);

    if (!result.success) {
      console.error(`[${new Date().toISOString()}] 예약 생성 실패:`, result.error);
      return NextResponse.json(result, { status: 400 });
    }

    console.log(`[${new Date().toISOString()}] 예약 생성 성공: ${result.reservation?.id}`);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${method} ${endpoint} 오류:`, error);

    // JSON 파싱 오류
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: '올바른 JSON 형식이 아닙니다.',
        } as CreateReservationResponse,
        { status: 400 },
      );
    }

    // 기타 오류
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      } as CreateReservationResponse,
      { status: 500 },
    );
  }
}

/**
 * 지원하지 않는 HTTP 메서드 처리
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'GET 메서드는 지원하지 않습니다.' },
    { status: 405 },
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'PUT 메서드는 지원하지 않습니다.' },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'DELETE 메서드는 지원하지 않습니다.' },
    { status: 405 },
  );
}
