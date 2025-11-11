'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetReservationsRequest,
  type GetReservationsResponse,
} from '@/features/reservation-management/api';
import { queryKeys } from '@/lib/query-keys';

export async function fetchReservations(
  request: GetReservationsRequest,
): Promise<GetReservationsResponse> {
  const searchParams = new URLSearchParams({
    page: (request.page || 1).toString(),
    limit: (request.limit || 20).toString(),
  });

  if (request.search) {
    searchParams.append('search', request.search);
  }
  if (request.status) {
    searchParams.append('status', request.status);
  }
  if (request.hospitalId) {
    searchParams.append('hospitalId', request.hospitalId);
  }
  if (request.userId) {
    searchParams.append('userId', request.userId);
  }
  if (request.dateFrom) {
    searchParams.append('dateFrom', request.dateFrom);
  }
  if (request.dateTo) {
    searchParams.append('dateTo', request.dateTo);
  }

  const response = await fetch(`/api/admin/reservations?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('예약 데이터를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data; // API 응답에서 data 필드 추출
}

export function useReservations(request: GetReservationsRequest) {
  return useQuery({
    queryKey: queryKeys.reservations.list(request),
    queryFn: () => fetchReservations(request),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
  });
}
