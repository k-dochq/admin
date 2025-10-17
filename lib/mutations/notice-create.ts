import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  type CreateNoticeRequest,
  type UpdateNoticeRequest,
  type DeleteNoticeRequest,
} from '@/features/notice-management/api';

// 공지사항 생성
export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoticeRequest) => {
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('공지사항 생성에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '공지사항 생성에 실패했습니다.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('공지사항이 성공적으로 생성되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '공지사항 생성에 실패했습니다.');
    },
  });
}

// 공지사항 수정
export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateNoticeRequest) => {
      const response = await fetch(`/api/admin/notices/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('공지사항 수정에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '공지사항 수정에 실패했습니다.');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notice', variables.id] });
      toast.success('공지사항이 성공적으로 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '공지사항 수정에 실패했습니다.');
    },
  });
}

// 공지사항 삭제
export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteNoticeRequest) => {
      const response = await fetch(`/api/admin/notices/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('공지사항 삭제에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '공지사항 삭제에 실패했습니다.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('공지사항이 성공적으로 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.');
    },
  });
}
