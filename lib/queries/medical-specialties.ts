'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

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
}

export interface MedicalSpecialtiesResponse {
  medicalSpecialties: MedicalSpecialty[];
}

async function fetchMedicalSpecialties(): Promise<MedicalSpecialty[]> {
  if (typeof window === 'undefined') {
    throw new Error('fetchMedicalSpecialties can only be called on the client side');
  }

  const response = await fetch('/api/admin/medical-specialties');
  if (!response.ok) {
    throw new Error('Failed to fetch medical specialties');
  }

  const data: MedicalSpecialtiesResponse = await response.json();
  return data.medicalSpecialties || [];
}

export function useMedicalSpecialties() {
  return useQuery({
    queryKey: queryKeys.medicalSpecialties,
    queryFn: fetchMedicalSpecialties,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // initialData 제거 - 실제 로딩 상태를 정확히 표시하기 위해
  });
}
