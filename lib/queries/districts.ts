'use client';

import { useQuery } from '@tanstack/react-query';
import { District } from '@prisma/client';

export type DistrictOption = Pick<District, 'id' | 'name' | 'countryCode'>;

export async function fetchDistricts(): Promise<DistrictOption[]> {
  const response = await fetch('/api/admin/districts');
  if (!response.ok) throw new Error('Failed to fetch districts');
  return response.json();
}

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: fetchDistricts,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
}
