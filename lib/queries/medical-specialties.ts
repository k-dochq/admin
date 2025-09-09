import { useQuery } from '@tanstack/react-query';
import { MedicalSpecialtyType } from '@prisma/client';

export interface MedicalSpecialty {
  id: string;
  name: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  specialtyType: MedicalSpecialtyType;
  order: number | null;
}

export async function fetchMedicalSpecialties(): Promise<MedicalSpecialty[]> {
  const response = await fetch('/api/admin/medical-specialties');
  if (!response.ok) throw new Error('Failed to fetch medical specialties');
  return response.json();
}

export function useMedicalSpecialties() {
  return useQuery({
    queryKey: ['medical-specialties'],
    queryFn: fetchMedicalSpecialties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
