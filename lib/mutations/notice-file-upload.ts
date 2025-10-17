import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  type UploadNoticeFileRequest,
  type DeleteNoticeFileRequest,
} from '@/features/notice-management/api';

// 공지사항 파일 업로드
export function useUploadNoticeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadNoticeFileRequest) => {
      const response = await fetch(`/api/admin/notices/${data.noticeId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '파일 업로드에 실패했습니다.');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notice-files', variables.noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notice', variables.noticeId] });
      toast.success('파일이 성공적으로 업로드되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
    },
  });
}

// 공지사항 파일 삭제
export function useDeleteNoticeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteNoticeFileRequest) => {
      const response = await fetch(`/api/admin/notices/${data.noticeId}/files/${data.fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('파일 삭제에 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '파일 삭제에 실패했습니다.');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notice-files', variables.noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notice', variables.noticeId] });
      toast.success('파일이 성공적으로 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '파일 삭제에 실패했습니다.');
    },
  });
}
