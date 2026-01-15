import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  GetReviewsRequest,
  GetReviewsResponse,
  UpdateReviewRequest,
  CreateReviewRequest,
  ReviewDetail,
  BatchUpdateReviewsRequest,
  BatchUpdateReviewsByHospitalRequest,
} from '@/features/review-management/api/entities/types';
import { queryKeys } from '@/lib/query-keys';

// 리뷰 목록 조회
export function useReviews(params: GetReviewsRequest = {}) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: async (): Promise<GetReviewsResponse> => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.hospitalId) searchParams.set('hospitalId', params.hospitalId);
      if (params.medicalSpecialtyId)
        searchParams.set('medicalSpecialtyId', params.medicalSpecialtyId);
      if (params.rating !== undefined) searchParams.set('rating', params.rating.toString());
      if (params.isRecommended !== undefined)
        searchParams.set('isRecommended', params.isRecommended.toString());
      if (params.userType) searchParams.set('userType', params.userType);

      const response = await fetch(`/api/admin/reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
  });
}

// 개별 리뷰 조회
export function useReviewById(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.review(id),
    queryFn: async (): Promise<ReviewDetail> => {
      const response = await fetch(`/api/admin/reviews/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }
      return response.json();
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 리뷰 생성
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest): Promise<ReviewDetail> => {
      const response = await fetch('/api/admin/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review');
      }

      return response.json();
    },
    onSuccess: () => {
      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to create review:', error);
    },
  });
}

// 리뷰 수정
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateReviewRequest;
    }): Promise<ReviewDetail> => {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 개별 리뷰 캐시 업데이트
      queryClient.setQueryData(queryKeys.review(variables.id), data);

      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to update review:', error);
    },
  });
}

// 리뷰 삭제
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }
    },
    onSuccess: (_, id) => {
      // 개별 리뷰 캐시 제거
      queryClient.removeQueries({ queryKey: queryKeys.review(id) });

      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
    },
  });
}

// 리뷰 일괄 업데이트
export function useBatchUpdateReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BatchUpdateReviewsRequest,
    ): Promise<{ success: boolean; updatedCount: number }> => {
      const response = await fetch('/api/admin/reviews/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to batch update reviews');
      }

      return response.json();
    },
    onSuccess: () => {
      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to batch update reviews:', error);
    },
  });
}

// 병원별 리뷰 일괄 업데이트
export function useBatchUpdateReviewsByHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BatchUpdateReviewsByHospitalRequest,
    ): Promise<{ success: boolean; updatedCount: number; hospitalId: string }> => {
      const response = await fetch('/api/admin/reviews/batch-by-hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to batch update reviews by hospital');
      }

      return response.json();
    },
    onSuccess: () => {
      // 리뷰 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to batch update reviews by hospital:', error);
    },
  });
}
