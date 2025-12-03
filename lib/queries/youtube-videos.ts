import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type {
  GetYoutubeVideosRequest,
  GetYoutubeVideosResponse,
  CreateYoutubeVideoRequest,
  UpdateYoutubeVideoRequest,
} from '@/features/youtube-video-management/api/entities/types';

async function fetchYoutubeVideos(
  request?: GetYoutubeVideosRequest,
): Promise<GetYoutubeVideosResponse> {
  const params = new URLSearchParams();
  if (request?.page) {
    params.append('page', String(request.page));
  }
  if (request?.limit) {
    params.append('limit', String(request.limit));
  }
  if (request?.categoryId) {
    params.append('categoryId', request.categoryId);
  }
  if (request?.isActive !== undefined) {
    params.append('isActive', String(request.isActive));
  }

  const response = await fetch(`/api/admin/youtube-videos?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtube videos');
  }
  return response.json();
}

async function fetchYoutubeVideoById(id: string) {
  const response = await fetch(`/api/admin/youtube-videos/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtube video');
  }
  return response.json();
}

async function createYoutubeVideo(data: CreateYoutubeVideoRequest) {
  const response = await fetch('/api/admin/youtube-videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create youtube video');
  }
  return response.json();
}

async function updateYoutubeVideo(id: string, data: UpdateYoutubeVideoRequest) {
  const response = await fetch(`/api/admin/youtube-videos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update youtube video');
  }
  return response.json();
}

async function deleteYoutubeVideo(id: string) {
  const response = await fetch(`/api/admin/youtube-videos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete youtube video');
  }
  return response.json();
}

async function fetchYoutubeVideoThumbnails(videoId: string) {
  const response = await fetch(`/api/admin/youtube-videos/${videoId}/thumbnails`);
  if (!response.ok) {
    throw new Error('Failed to fetch youtube video thumbnails');
  }
  return response.json();
}

async function createYoutubeVideoThumbnail(
  videoId: string,
  data: { imageUrl: string; locale: 'ko' | 'en' | 'th'; alt?: string | null },
) {
  const response = await fetch(`/api/admin/youtube-videos/${videoId}/thumbnails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create youtube video thumbnail');
  }
  return response.json();
}

async function deleteYoutubeVideoThumbnail(imageId: string) {
  const response = await fetch(`/api/admin/youtube-videos/thumbnails/${imageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete youtube video thumbnail');
  }
  return response.json();
}

export function useYoutubeVideos(request?: GetYoutubeVideosRequest) {
  return useQuery({
    queryKey: queryKeys.youtubeVideos(request),
    queryFn: () => fetchYoutubeVideos(request),
  });
}

export function useYoutubeVideoById(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.youtubeVideo(id),
    queryFn: () => fetchYoutubeVideoById(id),
    enabled: enabled && !!id,
  });
}

export function useCreateYoutubeVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createYoutubeVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideos() });
    },
  });
}

export function useUpdateYoutubeVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateYoutubeVideoRequest }) =>
      updateYoutubeVideo(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideos() });
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideo(variables.id) });
    },
  });
}

export function useDeleteYoutubeVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteYoutubeVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideos() });
    },
  });
}

export function useYoutubeVideoThumbnails(videoId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.youtubeVideoThumbnails(videoId),
    queryFn: () => fetchYoutubeVideoThumbnails(videoId),
    enabled: enabled && !!videoId,
  });
}

export function useCreateYoutubeVideoThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoId,
      data,
    }: {
      videoId: string;
      data: { imageUrl: string; locale: 'ko' | 'en' | 'th'; alt?: string | null };
    }) => createYoutubeVideoThumbnail(videoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.youtubeVideoThumbnails(variables.videoId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideo(variables.videoId) });
    },
  });
}

export function useDeleteYoutubeVideoThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId, videoId }: { imageId: string; videoId: string }) =>
      deleteYoutubeVideoThumbnail(imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.youtubeVideoThumbnails(variables.videoId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.youtubeVideo(variables.videoId) });
    },
  });
}
