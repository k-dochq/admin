'use client';

import { useQuery } from '@tanstack/react-query';
import { type ChatRoom, type PaginatedChatRoomsResponse } from '@/lib/types/consultation';

export async function fetchAdminChatRooms(
  page: number = 1,
  limit: number = 10,
  excludeTestAccounts: boolean = true,
): Promise<PaginatedChatRoomsResponse> {
  const excludeParam = excludeTestAccounts ? 'true' : 'false';
  const response = await fetch(
    `/api/admin/consultations/chat-rooms?page=${page}&limit=${limit}&excludeTestAccounts=${excludeParam}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch chat rooms');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch chat rooms');
  }

  return result.data;
}

export function useAdminChatRooms(
  page: number = 1,
  limit: number = 10,
  excludeTestAccounts: boolean = true,
) {
  return useQuery({
    queryKey: ['admin', 'consultations', 'chat-rooms', page, limit, excludeTestAccounts],
    queryFn: () => fetchAdminChatRooms(page, limit, excludeTestAccounts),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: (previousData) => previousData, // 이전 데이터 유지
  });
}
