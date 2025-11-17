'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';

interface DeleteConsultationMemoParams {
  id: string;
  userId: string;
  hospitalId: string;
}

async function deleteConsultationMemo(id: string): Promise<void> {
  const response = await fetch(`/api/admin/consultations/memos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete memo');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete memo');
  }
}

export function useDeleteConsultationMemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteConsultationMemoParams) => deleteConsultationMemo(id),
    onSuccess: (_, variables) => {
      // 메모 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultationMemos(variables.userId, variables.hospitalId),
      });
      toast.success('메모가 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('Failed to delete consultation memo:', error);
      toast.error(error instanceof Error ? error.message : '메모 삭제에 실패했습니다.');
    },
  });
}
