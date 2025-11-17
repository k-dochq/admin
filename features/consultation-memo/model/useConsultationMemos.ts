'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  type ConsultationMemoWithRelations,
  type GetConsultationMemosRequest,
} from '../api/entities/types';

async function fetchConsultationMemos(
  request: GetConsultationMemosRequest,
): Promise<ConsultationMemoWithRelations[]> {
  const params = new URLSearchParams({
    userId: request.userId,
    hospitalId: request.hospitalId,
  });

  const response = await fetch(`/api/admin/consultations/memos?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch consultation memos');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch consultation memos');
  }

  return data.data?.memos || [];
}

export function useConsultationMemos(userId: string, hospitalId: string) {
  return useQuery({
    queryKey: queryKeys.consultationMemos(userId, hospitalId),
    queryFn: () => fetchConsultationMemos({ userId, hospitalId }),
    staleTime: 30 * 1000, // 30 seconds
  });
}
