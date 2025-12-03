import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type {
  GetYoutubeVideoCategoriesRequest,
  GetYoutubeVideoCategoriesResponse,
  CreateYoutubeVideoCategoryRequest,
  UpdateYoutubeVideoCategoryRequest,
} from '@/features/youtube-video-management/api/entities/types';

async function fetchYoutubeVideoCategories(
  request?: GetYoutubeVideoCategoriesRequest,
): Promise<GetYoutubeVideoCategoriesResponse> {
  const params = new URLSearchParams();
  if (request?.isActive !== undefined) {
    params.append('isActive', String(request.isActive));
  }

  const response = await fetch(`/api/admin/youtube-video-categories?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtube video categories');
  }
  return response.json();
}

async function fetchYoutubeVideoCategoryById(id: string) {
  const response = await fetch(`/api/admin/youtube-video-categories/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtube video category');
  }
  return response.json();
}

async function createYoutubeVideoCategory(data: CreateYoutubeVideoCategoryRequest) {
  const response = await fetch('/api/admin/youtube-video-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create youtube video category');
  }
  return response.json();
}

async function updateYoutubeVideoCategory(id: string, data: UpdateYoutubeVideoCategoryRequest) {
  const response = await fetch(`/api/admin/youtube-video-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update youtube video category');
  }
  return response.json();
}

async function deleteYoutubeVideoCategory(id: string) {
  const response = await fetch(`/api/admin/youtube-video-categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete youtube video category');
  }
  return response.json();
}

export function useYoutubeVideoCategories(request?: GetYoutubeVideoCategoriesRequest) {
  return useQuery({
    queryKey: queryKeys.youtubeVideoCategories(request),
    queryFn: () => fetchYoutubeVideoCategories(request),
  });
}

export function useYoutubeVideoCategoryById(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.youtubeVideoCategory(id),
    queryFn: () => fetchYoutubeVideoCategoryById(id),
    enabled: enabled && !!id,
  });
}

export function useCreateYoutubeVideoCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createYoutubeVideoCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['youtube-video-categories'],
        exact: false,
      });
    },
  });
}

export function useUpdateYoutubeVideoCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateYoutubeVideoCategoryRequest }) =>
      updateYoutubeVideoCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['youtube-video-categories'],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideoCategory(variables.id) });
    },
  });
}

export function useDeleteYoutubeVideoCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteYoutubeVideoCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['youtube-video-categories'],
        exact: false,
      });
    },
  });
}
