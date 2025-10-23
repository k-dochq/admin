import { useQuery } from '@tanstack/react-query';
import { type EventBannerWithImages } from '@/features/banner-management/api';

export function useBanner(id: string) {
  return useQuery<EventBannerWithImages>({
    queryKey: ['banner', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/banners/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch banner');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useBannerImages(bannerId: string) {
  return useQuery({
    queryKey: ['banner-images', bannerId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/banners/${bannerId}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch banner images');
      }
      return response.json();
    },
    enabled: !!bannerId,
  });
}
