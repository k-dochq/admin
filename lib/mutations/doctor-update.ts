'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  type UpdateDoctorRequest,
  type UpdateDoctorResponse,
} from '@/features/doctor-management/api/entities/types';

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDoctorRequest): Promise<UpdateDoctorResponse> => {
      const response = await fetch(`/api/admin/doctors/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '의사 수정에 실패했습니다.');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (_, variables) => {
      // 의사 목록 쿼리 무효화 (모든 페이지, 필터 조건 포함)
      queryClient.invalidateQueries({
        queryKey: ['doctors'], // 'doctors'로 시작하는 모든 쿼리 무효화
      });

      // 특정 의사 쿼리도 무효화 (수정된 의사 상세 정보 재조회)
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctor(variables.id),
      });
    },
    onError: (error) => {
      console.error('의사 수정 실패:', error);
    },
  });
}
