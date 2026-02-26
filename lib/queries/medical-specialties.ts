'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateMedicalSpecialtyRequest,
  UpdateMedicalSpecialtyRequest,
} from '@/features/medical-specialty-management/api';

export interface MedicalSpecialty {
  id: string;
  name: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  specialtyType: string;
  description?: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentSpecialtyId?: string | null;
}

export interface MedicalSpecialtiesResponse {
  medicalSpecialties: MedicalSpecialty[];
}

async function fetchMedicalSpecialties(isActive?: boolean): Promise<MedicalSpecialty[]> {
  if (typeof window === 'undefined') {
    throw new Error('fetchMedicalSpecialties can only be called on the client side');
  }

  const params = new URLSearchParams();
  if (isActive !== undefined) {
    params.set('isActive', String(isActive));
  }

  const response = await fetch(`/api/admin/medical-specialties?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch medical specialties');
  }

  const result = await response.json();
  const data = result.data ?? result;
  return data.medicalSpecialties || [];
}

export function useMedicalSpecialties(isActive?: boolean) {
  return useQuery({
    queryKey: queryKeys.medicalSpecialties(isActive),
    queryFn: () => fetchMedicalSpecialties(isActive),
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

async function fetchMedicalSpecialty(id: string): Promise<MedicalSpecialty> {
  if (typeof window === 'undefined') {
    throw new Error('fetchMedicalSpecialty can only be called on the client side');
  }

  const response = await fetch(`/api/admin/medical-specialties/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch medical specialty');
  }

  const result = await response.json();
  return result.data;
}

export function useMedicalSpecialty(id: string) {
  return useQuery({
    queryKey: queryKeys.medicalSpecialty(id),
    queryFn: () => fetchMedicalSpecialty(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

async function createMedicalSpecialty(
  data: CreateMedicalSpecialtyRequest,
): Promise<MedicalSpecialty> {
  if (typeof window === 'undefined') {
    throw new Error('createMedicalSpecialty can only be called on the client side');
  }

  const response = await fetch('/api/admin/medical-specialties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create medical specialty');
  }

  const result = await response.json();
  return result.data;
}

export function useCreateMedicalSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalSpecialty,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'medical-specialties',
      });
    },
  });
}

async function updateMedicalSpecialty({
  id,
  data,
}: {
  id: string;
  data: UpdateMedicalSpecialtyRequest;
}): Promise<MedicalSpecialty> {
  if (typeof window === 'undefined') {
    throw new Error('updateMedicalSpecialty can only be called on the client side');
  }

  const response = await fetch(`/api/admin/medical-specialties/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update medical specialty');
  }

  const result = await response.json();
  return result.data;
}

export function useUpdateMedicalSpecialty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalSpecialty,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'medical-specialties' ||
          (query.queryKey[0] === 'medical-specialties' && query.queryKey[1] === variables.id),
      });
    },
  });
}
