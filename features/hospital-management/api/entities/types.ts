import { Hospital, District, Prisma, MedicalSpecialtyType } from '@prisma/client';

// 요청 타입들
export interface GetHospitalsRequest {
  page?: number;
  limit?: number;
  search?: string;
  medicalSpecialtyId?: string; // 진료부위 필터
}

// 응답 타입들
export interface GetHospitalsResponse {
  hospitals: HospitalWithDistrict[];
  total: number;
  page: number;
  limit: number;
}

// 도메인 엔티티 타입들
export type HospitalWithDistrict = Hospital & {
  district?: Pick<District, 'id' | 'name' | 'countryCode'> | null;
  products?: Array<{
    id: string;
    name: Prisma.JsonValue;
    description: Prisma.JsonValue;
  }>;
  hospitalSpecialties?: Array<{
    id: string;
    medicalSpecialty: {
      id: string;
      name: Prisma.JsonValue;
      specialtyType: MedicalSpecialtyType;
      order: number | null;
    };
  }>;
};

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};
