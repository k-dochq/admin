'use client';

import { type QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { DEFAULT_DOCTORS_REQUEST } from '../entities/constants';

/**
 * 의사 목록 관련 캐시를 무효화합니다.
 */
export function invalidateDoctorsCache(queryClient: QueryClient) {
  // 기본 의사 목록 쿼리 무효화
  queryClient.invalidateQueries({
    queryKey: queryKeys.doctorsList(DEFAULT_DOCTORS_REQUEST),
  });

  // 모든 의사 목록 쿼리 무효화 (다른 필터/페이지 포함)
  queryClient.invalidateQueries({
    queryKey: queryKeys.doctors,
  });
}

/**
 * 특정 의사 캐시를 무효화합니다.
 */
export function invalidateDoctorCache(queryClient: QueryClient, doctorId: string) {
  queryClient.invalidateQueries({
    queryKey: queryKeys.doctor(doctorId),
  });
}
