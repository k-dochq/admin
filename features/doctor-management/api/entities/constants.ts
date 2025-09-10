'use client';

import { type GetDoctorsRequest } from './types';

/**
 * 의사 목록 조회 기본 요청 파라미터
 */
export const DEFAULT_DOCTORS_REQUEST: GetDoctorsRequest = {
  page: 1,
  limit: 20,
};

/**
 * 의사 목록 조회 요청 파라미터 생성 함수
 */
export function createDoctorsRequest(
  overrides: Partial<GetDoctorsRequest> = {},
): GetDoctorsRequest {
  return {
    ...DEFAULT_DOCTORS_REQUEST,
    ...overrides,
  };
}
