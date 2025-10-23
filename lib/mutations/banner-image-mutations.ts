import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EventBannerLocale } from '@prisma/client';
import { uploadBannerImageClient } from '@/shared/lib/supabase-client';

export function useUploadBannerImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bannerId: string; locale: EventBannerLocale; file: File }) => {
      // 1. 먼저 Supabase Storage에 이미지 업로드
      const uploadResult = await uploadBannerImageClient({
        file: data.file,
        bannerId: data.bannerId,
        locale: data.locale,
      });

      if (!uploadResult.success || !uploadResult.imageUrl) {
        throw new Error(uploadResult.error || 'Failed to upload image to storage');
      }

      // 2. 업로드된 이미지 URL로 API 호출하여 DB 저장
      const response = await fetch(`/api/admin/banners/${data.bannerId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadResult.imageUrl,
          locale: data.locale,
          alt: data.file.name,
        }),
      });

      if (!response.ok) {
        // DB 저장 실패 시 업로드된 이미지를 Storage에서 삭제하는 것이 좋지만,
        // 일단은 에러만 throw
        throw new Error('Failed to save banner image to database');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banner-images', variables.bannerId] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.bannerId] });
      // 배너 목록 페이지 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useDeleteBannerImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bannerId: string; imageId: string; storagePath: string }) => {
      // 1. 먼저 Supabase Storage에서 이미지 삭제
      const { deleteBannerImageClient } = await import('@/shared/lib/supabase-client');
      const deleteResult = await deleteBannerImageClient(data.storagePath);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete image from storage');
      }

      // 2. DB에서 이미지 정보 삭제
      const response = await fetch(`/api/admin/banners/${data.bannerId}/images/${data.imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner image from database');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banner-images', variables.bannerId] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.bannerId] });
      // 배너 목록 페이지 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}
