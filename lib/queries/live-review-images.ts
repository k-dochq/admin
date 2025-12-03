import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LiveReviewImage {
  id: string;
  liveReviewId: string;
  imageUrl: string;
  alt: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 생생후기 이미지 목록 조회
export function useLiveReviewImages(liveReviewId: string) {
  return useQuery({
    queryKey: ['live-review-images', liveReviewId],
    queryFn: async (): Promise<LiveReviewImage[]> => {
      const response = await fetch(`/api/admin/live-reviews/${liveReviewId}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch live review images');
      }
      return response.json();
    },
    enabled: !!liveReviewId,
  });
}

// 생생후기 이미지 삭제
export function useDeleteLiveReviewImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/admin/live-reviews/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete live review image');
      }
      return response.json();
    },
    onSuccess: () => {
      // 모든 생생후기 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['live-review-images'] });
    },
  });
}
