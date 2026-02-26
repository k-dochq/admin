import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteMedicalSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/medical-specialties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '진료부위 삭제에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'medical-specialties',
      });
    },
    onError: (error) => {
      console.error('진료부위 삭제 실패:', error);
    },
  });
}
