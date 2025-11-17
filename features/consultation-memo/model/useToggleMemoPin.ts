import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  type ConsultationMemoApiResponse,
  type ConsultationMemoResponse,
} from '../api/entities/types';
import { toast } from 'sonner';

async function toggleMemoPin(
  id: string,
  userId: string,
  hospitalId: string,
): Promise<ConsultationMemoResponse> {
  const response = await fetch(`/api/admin/consultations/memos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'togglePin' }),
  });

  const result: ConsultationMemoApiResponse<ConsultationMemoResponse> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to toggle pin');
  }
  return result.data!;
}

export function useToggleMemoPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId, hospitalId }: { id: string; userId: string; hospitalId: string }) =>
      toggleMemoPin(id, userId, hospitalId),
    onSuccess: (_, variables) => {
      // 메모 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultationMemos(variables.userId, variables.hospitalId),
      });
      toast.success('상단 고정 상태가 변경되었습니다.');
    },
    onError: (error) => {
      console.error('Failed to toggle memo pin:', error);
      toast.error(error instanceof Error ? error.message : '상단 고정 변경에 실패했습니다.');
    },
  });
}
