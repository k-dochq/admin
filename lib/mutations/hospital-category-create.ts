import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { CreateHospitalCategoryRequest } from '@/features/hospital-category-management/api';

export function useCreateHospitalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHospitalCategoryRequest) => {
      const response = await fetch('/api/admin/hospital-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '병원 카테고리 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'hospital-categories';
        },
      });
    },
    onError: (error) => {
      console.error('병원 카테고리 생성 실패:', error);
    },
  });
}
