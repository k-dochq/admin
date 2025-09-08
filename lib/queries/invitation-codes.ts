'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { InvitationCodesResponse } from '@/lib/types/invitation-code';

export async function fetchInvitationCodes(): Promise<InvitationCodesResponse> {
  // 클라이언트 사이드에서만 실행되도록 보호
  if (typeof window === 'undefined') {
    throw new Error('fetchInvitationCodes can only be called on the client side');
  }

  const response = await fetch('/api/admin/invitation-codes');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch invitation codes');
  }

  return response.json();
}

export function useInvitationCodes() {
  return useQuery({
    queryKey: queryKeys.invitationCodes,
    queryFn: fetchInvitationCodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// useSuspenseQuery는 서버 사이드에서 실행될 수 있으므로 제거
// 대신 useInvitationCodes를 사용하고 로딩 상태를 직접 처리
