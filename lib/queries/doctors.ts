'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type GetDoctorsRequest,
  type GetDoctorsResponse,
  type CreateDoctorRequest,
  type UpdateDoctorRequest,
  type DoctorForList,
} from '@/features/doctor-management/api/entities/types';
import { queryKeys } from '@/lib/query-keys';

export async function fetchDoctors(request: GetDoctorsRequest): Promise<GetDoctorsResponse> {
  const params = new URLSearchParams({
    page: request.page.toString(),
    limit: request.limit.toString(),
  });

  if (request.search) params.append('search', request.search);
  if (request.hospitalId) params.append('hospitalId', request.hospitalId);
  if (request.genderType) params.append('genderType', request.genderType);
  if (request.approvalStatusType) params.append('approvalStatusType', request.approvalStatusType);
  if (request.stop !== undefined) params.append('stop', request.stop.toString());

  const response = await fetch(`/api/admin/doctors?${params.toString()}`);

  if (!response.ok) {
    throw new Error('의사 목록을 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

export async function fetchDoctorById(id: string): Promise<{ doctor: DoctorForList }> {
  const response = await fetch(`/api/admin/doctors/${id}`);

  if (!response.ok) {
    throw new Error('의사 정보를 불러오는데 실패했습니다.');
  }

  const result = await response.json();
  return result.data;
}

export async function createDoctor(data: CreateDoctorRequest): Promise<DoctorForList> {
  const response = await fetch('/api/admin/doctors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '의사 생성에 실패했습니다.');
  }

  const result = await response.json();
  return result.doctor;
}

export async function updateDoctor(data: UpdateDoctorRequest): Promise<DoctorForList> {
  const response = await fetch(`/api/admin/doctors/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '의사 정보 수정에 실패했습니다.');
  }

  const result = await response.json();
  return result.doctor;
}

export async function deleteDoctor(id: string): Promise<void> {
  const response = await fetch(`/api/admin/doctors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '의사 삭제에 실패했습니다.');
  }
}

// React Query 훅들
export function useDoctors(request: GetDoctorsRequest) {
  return useQuery({
    queryKey: queryKeys.doctorsList(request),
    queryFn: () => fetchDoctors(request),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function useDoctorById(id: string) {
  return useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: () => fetchDoctorById(id),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      // 의사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
    },
    onError: (error) => {
      console.error('의사 생성 실패:', error);
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (data) => {
      // 특정 의사 쿼리 무효화 (시술부위 정보 포함하여 서버에서 최신 데이터 가져오기)
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor(data.id) });
      // 의사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
    },
    onError: (error) => {
      console.error('의사 수정 실패:', error);
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: (_, id) => {
      // 특정 의사 쿼리 제거
      queryClient.removeQueries({ queryKey: [queryKeys.doctor(id)] });
      // 의사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
    },
    onError: (error) => {
      console.error('의사 삭제 실패:', error);
    },
  });
}
