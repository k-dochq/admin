import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateHospitalRequest } from '@/features/hospital-edit/api';

export function useCreateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHospitalRequest) => {
      const response = await fetch('/api/admin/hospitals/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '병원 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 모든 병원 관련 쿼리 무효화 (부분 매칭으로 모든 병원 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'hospitals';
        },
      });
    },
    onError: (error) => {
      console.error('병원 생성 실패:', error);
    },
  });
}
