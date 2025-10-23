import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type EventBannerLocale } from '@prisma/client';

export function useUploadBannerImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bannerId: string; locale: EventBannerLocale; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('locale', data.locale);

      const response = await fetch(`/api/admin/banners/${data.bannerId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload banner image');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banner-images', variables.bannerId] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.bannerId] });
    },
  });
}

export function useDeleteBannerImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bannerId: string; imageId: string }) => {
      const response = await fetch(`/api/admin/banners/${data.bannerId}/images/${data.imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete banner image');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['banner-images', variables.bannerId] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.bannerId] });
    },
  });
}
