'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  type ConsultationMemoWithRelations,
  type UpdateConsultationMemoRequest,
} from '../api/entities/types';

async function updateConsultationMemo(
  id: string,
  request: UpdateConsultationMemoRequest,
): Promise<ConsultationMemoWithRelations> {
  const response = await fetch(`/api/admin/consultations/memos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update memo');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to update memo');
  }

  return data.data;
}

export function useUpdateConsultationMemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...request }: UpdateConsultationMemoRequest & { id: string }) =>
      updateConsultationMemo(id, request),
    onSuccess: (data) => {
      // 메모 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultationMemos(data.userId, data.hospitalId),
      });
      toast.success('메모가 수정되었습니다.');
    },
    onError: (error) => {
      console.error('Failed to update consultation memo:', error);
      toast.error(error instanceof Error ? error.message : '메모 수정에 실패했습니다.');
    },
  });
}
