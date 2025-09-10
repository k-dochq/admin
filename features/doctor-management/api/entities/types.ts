import { Prisma } from '@prisma/client';

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

// Prisma 타입을 활용한 의사 타입 정의
export type DoctorWithHospital = Prisma.DoctorGetPayload<{
  include: { hospital: true };
}>;

export type DoctorForList = {
  id: string;
  name: LocalizedText;
  position?: LocalizedText;
  licenseNumber?: string;
  licenseDate?: Date;
  description?: string;
  genderType: 'MALE' | 'FEMALE';
  viewCount: number;
  bookmarkCount: number;
  order?: number;
  stop: boolean;
  approvalStatusType: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL';
  hospitalId: string;
  hospital: {
    id: string;
    name: LocalizedText;
  };
  doctorSpecialties?: {
    medicalSpecialtyId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export interface GetDoctorsRequest {
  page: number;
  limit: number;
  search?: string;
  hospitalId?: string;
  genderType?: 'MALE' | 'FEMALE';
  approvalStatusType?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL';
  stop?: boolean;
}

export interface GetDoctorsResponse {
  doctors: DoctorForList[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDoctorRequest {
  name: LocalizedText;
  position?: LocalizedText;
  licenseNumber?: string;
  licenseDate?: Date;
  description?: string;
  genderType: 'MALE' | 'FEMALE';
  hospitalId: string;
  order?: number;
  medicalSpecialtyIds?: string[];
}

export interface UpdateDoctorRequest {
  id: string;
  name: LocalizedText;
  position?: LocalizedText;
  licenseNumber?: string;
  licenseDate?: Date;
  description?: string;
  genderType: 'MALE' | 'FEMALE';
  hospitalId: string;
  order?: number;
  stop?: boolean;
  approvalStatusType?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL';
  medicalSpecialtyIds?: string[];
}

export interface CreateDoctorResponse {
  success: boolean;
  doctor: DoctorForList;
}

export interface UpdateDoctorResponse {
  success: boolean;
  doctor: DoctorForList;
}

export interface DeleteDoctorRequest {
  id: string;
}

export interface DeleteDoctorResponse {
  success: boolean;
}

// JsonValue에서 LocalizedText로 안전하게 변환하는 함수
export const parseLocalizedText = (jsonValue: Prisma.JsonValue | null): LocalizedText => {
  if (!jsonValue || typeof jsonValue !== 'object' || Array.isArray(jsonValue)) {
    return { ko_KR: '', en_US: '', th_TH: '' };
  }

  const obj = jsonValue as Record<string, unknown>;
  return {
    ko_KR: typeof obj.ko_KR === 'string' ? obj.ko_KR : '',
    en_US: typeof obj.en_US === 'string' ? obj.en_US : '',
    th_TH: typeof obj.th_TH === 'string' ? obj.th_TH : '',
  };
};

// JsonValue에서 안전하게 문자열로 변환하는 함수
export const parseJsonValueToString = (jsonValue: Prisma.JsonValue | null): string => {
  if (jsonValue === null || jsonValue === undefined) {
    return '';
  }

  if (typeof jsonValue === 'string') {
    return jsonValue;
  }

  if (typeof jsonValue === 'number' || typeof jsonValue === 'boolean') {
    return String(jsonValue);
  }

  if (typeof jsonValue === 'object' && jsonValue !== null) {
    if (!Array.isArray(jsonValue)) {
      const obj = jsonValue as Record<string, unknown>;
      // 한국어 우선, 없으면 영어, 없으면 태국어, 모두 없으면 첫 번째 문자열 값
      if (typeof obj.ko_KR === 'string' && obj.ko_KR.trim()) {
        return obj.ko_KR;
      }
      if (typeof obj.en_US === 'string' && obj.en_US.trim()) {
        return obj.en_US;
      }
      if (typeof obj.th_TH === 'string' && obj.th_TH.trim()) {
        return obj.th_TH;
      }

      // 다른 문자열 값 찾기
      for (const value of Object.values(obj)) {
        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
    }

    return '';
  }

  return '';
};
