import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  GetLiveReviewsRequest,
  GetLiveReviewsResponse,
  UpdateLiveReviewRequest,
  CreateLiveReviewRequest,
  LiveReviewDetail,
} from '@/features/live-review-management/api/entities/types';
import { queryKeys } from '@/lib/query-keys';

// 생생후기 목록 조회
export function useLiveReviews(params: GetLiveReviewsRequest = {}) {
  return useQuery({
    queryKey: queryKeys.liveReviews(params),
    queryFn: async (): Promise<GetLiveReviewsResponse> => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.hospitalId) searchParams.set('hospitalId', params.hospitalId);
      if (params.medicalSpecialtyId)
        searchParams.set('medicalSpecialtyId', params.medicalSpecialtyId);
      if (params.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());

      const response = await fetch(`/api/admin/live-reviews?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch live reviews');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    placeholderData: (previousData) => previousData, // 이전 데이터를 placeholder로 유지
  });
}

// 개별 생생후기 조회
export function useLiveReviewById(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.liveReview(id),
    queryFn: async (): Promise<LiveReviewDetail> => {
      const response = await fetch(`/api/admin/live-reviews/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch live review');
      }
      return response.json();
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 생생후기 생성
export function useCreateLiveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLiveReviewRequest): Promise<LiveReviewDetail> => {
      const response = await fetch('/api/admin/live-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create live review');
      }

      return response.json();
    },
    onSuccess: () => {
      // 생생후기 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['live-reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to create live review:', error);
    },
  });
}

// 생생후기 수정
export function useUpdateLiveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLiveReviewRequest;
    }): Promise<LiveReviewDetail> => {
      const response = await fetch(`/api/admin/live-reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update live review');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 개별 생생후기 캐시 업데이트
      queryClient.setQueryData(queryKeys.liveReview(variables.id), data);

      // 생생후기 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['live-reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to update live review:', error);
    },
  });
}

// 생생후기 삭제
export function useDeleteLiveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/admin/live-reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete live review');
      }
    },
    onSuccess: (_, id) => {
      // 개별 생생후기 캐시 제거
      queryClient.removeQueries({ queryKey: queryKeys.liveReview(id) });

      // 생생후기 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['live-reviews'],
        type: 'all',
      });
    },
    onError: (error) => {
      console.error('Failed to delete live review:', error);
    },
  });
}
