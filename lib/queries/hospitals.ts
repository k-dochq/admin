'use client';

import { useQuery } from '@tanstack/react-query';
import {
  type GetHospitalsRequest,
  type GetHospitalsResponse,
} from '@/features/hospital-management/api';

export async function fetchHospitals(request: GetHospitalsRequest): Promise<GetHospitalsResponse> {
  const searchParams = new URLSearchParams({
    page: (request.page || 1).toString(),
    limit: (request.limit || 20).toString(),
  });

  if (request.search) {
    searchParams.append('search', request.search);
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
    queryKey: ['hospitals', request],
    queryFn: () => fetchHospitals(request),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
  });
}
