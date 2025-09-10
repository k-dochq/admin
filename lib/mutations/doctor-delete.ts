'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { type DeleteDoctorResponse } from '@/features/doctor-management/api/entities/types';

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string): Promise<DeleteDoctorResponse> => {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '의사 삭제에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (_, doctorId) => {
      // 삭제된 의사의 개별 쿼리 제거
      queryClient.removeQueries({ queryKey: queryKeys.doctor(doctorId) });

      // 의사 목록 쿼리 무효화 (모든 페이지, 필터 조건 포함)
      queryClient.invalidateQueries({
        queryKey: ['doctors'], // 'doctors'로 시작하는 모든 쿼리 무효화
      });
    },
    onError: (error) => {
      console.error('의사 삭제 실패:', error);
    },
  });
}
