'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type {
  HospitalCategory,
  GetHospitalCategoriesResponse,
  CreateHospitalCategoryRequest,
  UpdateHospitalCategoryRequest,
} from '@/features/hospital-category-management/api';

async function fetchHospitalCategories(isActive?: boolean): Promise<HospitalCategory[]> {
  if (typeof window === 'undefined') {
    throw new Error('fetchHospitalCategories can only be called on the client side');
  }

  const params = new URLSearchParams();
  if (isActive !== undefined) {
    params.set('isActive', String(isActive));
  }

  const response = await fetch(`/api/admin/hospital-categories?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch hospital categories');
  }

  const responseData = await response.json();
  // formatSuccessResponse의 구조: { success: true, data: GetHospitalCategoriesResponse, message?: string }
  const data: GetHospitalCategoriesResponse = responseData.data;
  return data.categories || [];
}

export function useHospitalCategories(isActive?: boolean) {
  return useQuery({
    queryKey: queryKeys.hospitalCategories(isActive),
    queryFn: () => fetchHospitalCategories(isActive),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

async function fetchHospitalCategory(id: string): Promise<HospitalCategory> {
  if (typeof window === 'undefined') {
    throw new Error('fetchHospitalCategory can only be called on the client side');
  }

  const response = await fetch(`/api/admin/hospital-categories/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch hospital category');
  }

  const data = await response.json();
  return data.data;
}

export function useHospitalCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.hospitalCategory(id),
    queryFn: () => fetchHospitalCategory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

async function createHospitalCategory(
  data: CreateHospitalCategoryRequest,
): Promise<HospitalCategory> {
  if (typeof window === 'undefined') {
    throw new Error('createHospitalCategory can only be called on the client side');
  }

  const response = await fetch('/api/admin/hospital-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create hospital category');
  }

  const result = await response.json();
  return result.data;
}

export function useCreateHospitalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHospitalCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'hospital-categories',
      });
    },
  });
}

async function updateHospitalCategory({
  id,
  data,
}: {
  id: string;
  data: UpdateHospitalCategoryRequest;
}): Promise<HospitalCategory> {
  if (typeof window === 'undefined') {
    throw new Error('updateHospitalCategory can only be called on the client side');
  }

  const response = await fetch(`/api/admin/hospital-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update hospital category');
  }

  const result = await response.json();
  return result.data;
}

export function useUpdateHospitalCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHospitalCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'hospital-categories' ||
          (query.queryKey[0] === 'hospital-categories' && query.queryKey[1] === variables.id),
      });
    },
  });
}
