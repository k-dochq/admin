'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetHospitalsRequest,
  type GetHospitalsResponse,
} from '@/features/hospital-management/api';
import { queryKeys } from '@/lib/query-keys';
import { normalizeHospitalSearchTerm } from 'shared/lib';

export async function fetchHospitals(request: GetHospitalsRequest): Promise<GetHospitalsResponse> {
  const searchParams = new URLSearchParams({
    page: (request.page || 1).toString(),
    limit: (request.limit || 20).toString(),
  });

  if (request.search) {
    const normalizedSearch = normalizeHospitalSearchTerm(request.search);
    searchParams.append('search', normalizedSearch);
  }
  if (request.medicalSpecialtyId) {
    searchParams.append('medicalSpecialtyId', request.medicalSpecialtyId);
  }

  const response = await fetch(`/api/admin/hospitals?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('병원 데이터를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data; // API 응답에서 data 필드 추출
}

export function useHospitals(request: GetHospitalsRequest) {
  return useQuery({
    queryKey: queryKeys.hospitals.list(request),
    queryFn: () => fetchHospitals(request),
    staleTime: 30 * 60 * 1000, // 30분 (병원 데이터는 자주 변하지 않음 - API 호출 최소화)
    gcTime: 60 * 60 * 1000, // 1시간
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}
