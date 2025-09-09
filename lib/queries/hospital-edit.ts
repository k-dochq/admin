'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type GetHospitalByIdResponse,
  type UpdateHospitalRequest,
  type HospitalForEdit,
} from '@/features/hospital-edit/api';

export async function fetchHospitalById(id: string): Promise<GetHospitalByIdResponse> {
  const response = await fetch(`/api/admin/hospitals/${id}`);

  if (!response.ok) {
    throw new Error('병원 정보를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

export async function updateHospital(data: UpdateHospitalRequest): Promise<HospitalForEdit> {
  const response = await fetch(`/api/admin/hospitals/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('병원 정보를 수정하는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

export function useHospitalById(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: () => fetchHospitalById(id),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!id,
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHospital,
    onSuccess: (data, variables) => {
      // 특정 병원 캐시 업데이트
      queryClient.setQueryData(['hospital', variables.id], { hospital: data });
      // 병원 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
    onError: (error) => {
      console.error('Failed to update hospital:', error);
    },
  });
}
