import { useQuery } from '@tanstack/react-query';
import { type GetBannersRequest, type GetBannersResponse } from '@/features/banner-management/api';

export function useBanners(request: GetBannersRequest) {
  return useQuery<GetBannersResponse>({
    queryKey: ['banners', request],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (request.page) params.append('page', request.page.toString());
      if (request.limit) params.append('limit', request.limit.toString());
      if (request.isActive !== undefined) params.append('isActive', request.isActive.toString());
      if (request.orderBy) params.append('orderBy', request.orderBy);
      if (request.orderDirection) params.append('orderDirection', request.orderDirection);

      const response = await fetch(`/api/admin/banners?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      return response.json();
    },
  });
}
