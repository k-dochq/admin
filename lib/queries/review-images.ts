import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReviewImage {
  id: string;
  reviewId: string;
  imageType: 'BEFORE' | 'AFTER';
  imageUrl: string;
  alt: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 리뷰 이미지 목록 조회
export function useReviewImages(reviewId: string) {
  return useQuery({
    queryKey: ['review-images', reviewId],
    queryFn: async (): Promise<ReviewImage[]> => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/images`);
      if (!response.ok) {
        throw new Error('Failed to fetch review images');
      }
      return response.json();
    },
    enabled: !!reviewId,
  });
}

// 리뷰 이미지 삭제
export function useDeleteReviewImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(`/api/admin/reviews/images/${imageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete review image');
      }
      return response.json();
    },
    onSuccess: (_, imageId) => {
      // 모든 리뷰 이미지 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['review-images'] });
    },
  });
}
