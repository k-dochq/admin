import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  type ConsultationMemoApiResponse,
  type ConsultationMemoResponse,
} from '../api/entities/types';
import { toast } from 'sonner';

async function toggleMemoComplete(
  id: string,
  userId: string,
  hospitalId: string,
): Promise<ConsultationMemoResponse> {
  const response = await fetch(`/api/admin/consultations/memos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'toggleComplete' }),
  });

  const result: ConsultationMemoApiResponse<ConsultationMemoResponse> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to toggle complete');
  }
  return result.data!;
}

export function useToggleMemoComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, hospitalId }: { id: string; userId: string; hospitalId: string }) =>
      toggleMemoComplete(id, userId, hospitalId),
    onSuccess: (_, variables) => {
      // 메모 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultationMemos(variables.userId, variables.hospitalId),
      });
      toast.success('완료 처리 상태가 변경되었습니다.');
    },
    onError: (error) => {
      console.error('Failed to toggle memo complete:', error);
      toast.error(error instanceof Error ? error.message : '완료 처리 변경에 실패했습니다.');
    },
  });
}
