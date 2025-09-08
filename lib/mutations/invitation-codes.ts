import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateInvitationCodeRequest,
  CreateInvitationCodeResponse,
  InvitationCodesResponse,
} from '@/lib/types/invitation-code';

export function useCreateInvitationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateInvitationCodeRequest,
    ): Promise<CreateInvitationCodeResponse> => {
      const response = await fetch('/api/admin/invitation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create invitation code');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch invitation codes
      queryClient.invalidateQueries({ queryKey: queryKeys.invitationCodes });

      // Optionally add the new code to the cache immediately
      queryClient.setQueryData(
        queryKeys.invitationCodes,
        (old: InvitationCodesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: [data.data, ...old.data],
          };
        },
      );
    },
    onError: (error: Error) => {
      console.error('Failed to create invitation code:', error);
    },
  });
}

export function useDeleteInvitationCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/invitation-codes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete invitation code');
      }

      return response.json();
    },
    onSuccess: (_: unknown, id: string) => {
      // Optimistically remove the code from cache
      queryClient.setQueryData(
        queryKeys.invitationCodes,
        (old: InvitationCodesResponse | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((code) => code.id !== id),
          };
        },
      );

      // Remove invitation code from cache
      queryClient.removeQueries({ queryKey: queryKeys.invitationCode(id) });
      // Invalidate invitation codes list
      queryClient.invalidateQueries({ queryKey: queryKeys.invitationCodes });
    },
    onError: (error: Error) => {
      console.error('Failed to delete invitation code:', error);
    },
  });
}
