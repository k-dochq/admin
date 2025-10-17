import { useQuery } from '@tanstack/react-query';
import {
  type GetNoticesRequest,
  type NoticeWithFiles,
  type NoticeFile,
} from '@/features/notice-management/api';

// 공지사항 목록 조회
export function useNotices(request: GetNoticesRequest) {
  return useQuery({
    queryKey: ['notices', request],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: request.page.toString(),
        limit: request.limit.toString(),
        ...(request.search && { search: request.search }),
        ...(request.isActive !== undefined && { isActive: request.isActive.toString() }),
      });

      const response = await fetch(`/api/admin/notices?${params}`);
      if (!response.ok) {
        throw new Error('공지사항 목록을 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '공지사항 목록을 불러오는데 실패했습니다.');
      }

      return result.data;
    },
    staleTime: 60 * 1000, // 1분
  });
}

// 공지사항 상세 조회
export function useNoticeById(id: string) {
  return useQuery({
    queryKey: ['notice', id],
    queryFn: async (): Promise<NoticeWithFiles> => {
      const response = await fetch(`/api/admin/notices/${id}`);
      if (!response.ok) {
        throw new Error('공지사항을 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '공지사항을 불러오는데 실패했습니다.');
      }

      return result.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1분
  });
}

// 공지사항 파일 목록 조회
export function useNoticeFiles(noticeId: string) {
  return useQuery({
    queryKey: ['notice-files', noticeId],
    queryFn: async (): Promise<NoticeFile[]> => {
      const response = await fetch(`/api/admin/notices/${noticeId}/files`);
      if (!response.ok) {
        throw new Error('파일 목록을 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '파일 목록을 불러오는데 실패했습니다.');
      }

      return result.data;
    },
    enabled: !!noticeId,
    staleTime: 60 * 1000, // 1분
  });
}
