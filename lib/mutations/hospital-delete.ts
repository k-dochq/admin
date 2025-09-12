'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface DeleteHospitalRequest {
  id: string;
}

interface DeleteHospitalResponse {
  success: boolean;
  message: string;
}

async function deleteHospital(request: DeleteHospitalRequest): Promise<DeleteHospitalResponse> {
  const response = await fetch(`/api/admin/hospitals/${request.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '병원 삭제에 실패했습니다.');
  }

  return response.json();
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHospital,
    onSuccess: (data, variables) => {
      // 모든 병원 관련 쿼리 무효화 (부분 매칭으로 모든 병원 목록 쿼리 포함)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'hospitals';
        },
      });

      // 삭제된 병원의 상세 정보 쿼리 제거
      queryClient.removeQueries({
        queryKey: queryKeys.hospitals.detail(variables.id),
      });

      console.log('병원 삭제 성공:', data.message);
    },
    onError: (error: Error) => {
      console.error('병원 삭제 실패:', error.message);
    },
  });
}
