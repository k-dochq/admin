import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateHospitalCategoryRequest } from '@/features/hospital-category-management/api';

export function useUpdateHospitalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHospitalCategoryRequest }) => {
      const response = await fetch(`/api/admin/hospital-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '병원 카테고리 수정에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === 'hospital-categories' ||
            (query.queryKey[0] === 'hospital-categories' && query.queryKey[1] === variables.id)
          );
        },
      });
    },
    onError: (error) => {
      console.error('병원 카테고리 수정 실패:', error);
    },
  });
}
