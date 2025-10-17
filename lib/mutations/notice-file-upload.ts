import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadNoticeFileClient, deleteNoticeFileClient } from '@/shared/lib/supabase-client';
import {
  type UploadNoticeFileRequest,
  type DeleteNoticeFileRequest,
} from '@/features/notice-management/api';

// 공지사항 파일 업로드
export function useUploadNoticeFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file: File;
      noticeId: string;
      fileType: 'IMAGE' | 'ATTACHMENT';
    }) => {
      // 1. Supabase Storage에 직접 업로드
      const uploadResult = await uploadNoticeFileClient({
        file: data.file,
        noticeId: data.noticeId,
        fileType: data.fileType,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '업로드 실패');
      }

      // 2. 데이터베이스에 이미지 정보 저장
      const response = await fetch(`/api/admin/notices/${data.noticeId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileType: data.fileType,
          fileName: data.file.name,
          fileUrl: uploadResult.imageUrl,
          fileSize: data.file.size,
          mimeType: data.file.type,
          alt: data.file.name,
          order: 0,
          path: uploadResult.path,
        }),
      });

      if (!response.ok) {
        // 업로드는 성공했지만 DB 저장 실패 시 스토리지에서 삭제
        if (uploadResult.path) {
          await deleteNoticeFileClient(uploadResult.path);
        }
        throw new Error('데이터베이스 저장 실패');
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
    mutationFn: async (data: DeleteNoticeFileRequest & { path?: string }) => {
      // 1. Supabase Storage에서 파일 삭제 (path가 있는 경우)
      if (data.path) {
        const deleteResult = await deleteNoticeFileClient(data.path);
        if (!deleteResult.success) {
          console.warn('Storage 삭제 실패:', deleteResult.error);
          // Storage 삭제 실패해도 DB에서 삭제는 진행
        }
      }

      // 2. 데이터베이스에서 파일 정보 삭제
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
