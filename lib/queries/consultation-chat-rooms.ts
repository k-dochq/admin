'use client';

import { useQuery } from '@tanstack/react-query';
import { type ChatRoom } from '@/lib/types/consultation';

export async function fetchAdminChatRooms(): Promise<ChatRoom[]> {
  const response = await fetch('/api/admin/consultations/chat-rooms');

  if (!response.ok) {
    throw new Error('Failed to fetch chat rooms');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch chat rooms');
  }

  return result.data;
}

export function useAdminChatRooms() {
  return useQuery({
    queryKey: ['admin', 'consultations', 'chat-rooms'],
    queryFn: fetchAdminChatRooms,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
