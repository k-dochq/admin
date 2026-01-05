import { Hospital, District, HospitalApprovalStatusType } from '@prisma/client';
import { type LocalizedText } from '@/shared/lib/types/locale';

// Prisma에서 생성된 Hospital 타입을 기반으로 확장
export type HospitalWithDistrict = Hospital & {
  district?: Pick<District, 'id' | 'name' | 'countryCode'> | null;
};

// JSON 필드들의 타입 정의 (공통 타입 사용)
export type { LocalizedText };

export type HospitalSettings = {
  [key: string]: string | number | boolean | null;
};

export type HospitalPrices = {
  [key: string]: {
    price?: number;
    discountPrice?: number;
    currency?: string;
  };
};

export interface HospitalListResponse {
  hospitals: HospitalWithDistrict[];
  total: number;
  page: number;
  limit: number;
}

export interface HospitalFilters {
  search?: string;
  approvalStatus?: HospitalApprovalStatusType;
  districtId?: string;
  enableJp?: boolean;
  hasClone?: boolean;
}
