'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type CreateDoctorRequest,
  type CreateDoctorResponse,
} from '@/features/doctor-management/api/entities/types';

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDoctorRequest): Promise<CreateDoctorResponse> => {
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '의사 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 의사 목록 쿼리 무효화 (모든 페이지, 필터 조건 포함)
      queryClient.invalidateQueries({
        queryKey: ['doctors'], // 'doctors'로 시작하는 모든 쿼리 무효화
      });
    },
    onError: (error) => {
      console.error('의사 생성 실패:', error);
    },
  });
}
