'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { type HospitalImage } from '@/features/hospital-edit/api/entities/types';

export interface HospitalImagesResponse {
  success: boolean;
  hospitalImages: HospitalImage[];
}

export interface DeleteImageParams {
  hospitalId: string;
  imageId: string;
}

// 병원 이미지 목록 조회
async function fetchHospitalImages(hospitalId: string): Promise<HospitalImage[]> {
  if (typeof window === 'undefined') {
    throw new Error('fetchHospitalImages can only be called on the client side');
  }

  const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`);
  if (!response.ok) {
    throw new Error('Failed to fetch hospital images');
  }

  const data: HospitalImagesResponse = await response.json();
  return data.hospitalImages || [];
}

export function useHospitalImages(hospitalId: string) {
  return useQuery({
    queryKey: queryKeys.hospitals.images(hospitalId),
    queryFn: () => fetchHospitalImages(hospitalId),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!hospitalId,
  });
}

// 이미지 삭제
async function deleteHospitalImage(
  params: DeleteImageParams,
): Promise<{ success: boolean; message: string }> {
  const { hospitalId, imageId } = params;

  const response = await fetch(`/api/admin/hospitals/${hospitalId}/images/${imageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete image');
  }

  return response.json();
}

export function useDeleteHospitalImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHospitalImage,
    onSuccess: (_data, variables) => {
      // 해당 병원의 이미지 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.hospitals.images(variables.hospitalId),
      });

      // 병원 상세 정보도 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.hospitals.detail(variables.hospitalId),
      });
    },
    onError: (error) => {
      console.error('Failed to delete hospital image:', error);
    },
  });
}
