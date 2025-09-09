import { Hospital, District, Prisma } from '@prisma/client';

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

export type PriceInfo = {
  minPrice?: number;
  maxPrice?: number;
};

export type DaySchedule = {
  holiday?: boolean;
  openTime?: string;
  closeTime?: string;
};

export type OpeningHoursInfo = {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  launchTime?: {
    openTime?: string;
    closeTime?: string;
  };
};

// Prisma 타입을 활용한 강화된 타입 정의
export type HospitalWithDistrict = Prisma.HospitalGetPayload<{
  include: { district: true };
}>;

// District name을 위한 타입 가드 함수
export const isStringValue = (value: Prisma.JsonValue): value is string => {
  return typeof value === 'string';
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
    // LocalizedText 형태인지 확인
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

    // 객체나 배열인 경우 JSON 문자열로 변환하지 않고 빈 문자열 반환
    return '';
  }

  return '';
};

// District 타입을 위한 유틸리티 타입
export type DistrictForForm = {
  id: string;
  name: string;
  countryCode: District['countryCode'];
};

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

// JsonValue에서 PriceInfo로 안전하게 변환하는 함수
export const parsePriceInfo = (jsonValue: Prisma.JsonValue | null): PriceInfo | undefined => {
  if (!jsonValue || typeof jsonValue !== 'object' || Array.isArray(jsonValue)) {
    return undefined;
  }

  const obj = jsonValue as Record<string, unknown>;
  const result: PriceInfo = {};

  if (typeof obj.minPrice === 'number') {
    result.minPrice = obj.minPrice;
  }
  if (typeof obj.maxPrice === 'number') {
    result.maxPrice = obj.maxPrice;
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

// JsonValue에서 OpeningHoursInfo로 안전하게 변환하는 함수
export const parseOpeningHoursInfo = (
  jsonValue: Prisma.JsonValue | null,
): OpeningHoursInfo | undefined => {
  if (!jsonValue || typeof jsonValue !== 'object' || Array.isArray(jsonValue)) {
    return undefined;
  }

  const obj = jsonValue as Record<string, unknown>;
  const result: OpeningHoursInfo = {};

  // 요일별 스케줄 파싱
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  for (const day of days) {
    if (obj[day] && typeof obj[day] === 'object' && !Array.isArray(obj[day])) {
      const dayObj = obj[day] as Record<string, unknown>;
      result[day] = {
        holiday: typeof dayObj.holiday === 'boolean' ? dayObj.holiday : false,
        openTime: typeof dayObj.openTime === 'string' ? dayObj.openTime : undefined,
        closeTime: typeof dayObj.closeTime === 'string' ? dayObj.closeTime : undefined,
      };
    }
  }

  // 점심시간 파싱
  if (obj.launchTime && typeof obj.launchTime === 'object' && !Array.isArray(obj.launchTime)) {
    const launchObj = obj.launchTime as Record<string, unknown>;
    result.launchTime = {
      openTime: typeof launchObj.openTime === 'string' ? launchObj.openTime : undefined,
      closeTime: typeof launchObj.closeTime === 'string' ? launchObj.closeTime : undefined,
    };
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

export type HospitalFormData = {
  // 기본 정보
  name: LocalizedText;
  address: LocalizedText;
  directions: LocalizedText;
  phoneNumber: string;
  email: string;

  // 설명 및 메모
  description: LocalizedText;
  openingHours: LocalizedText; // 기존 다국어 진료시간
  memo: string;

  // 숫자 정보
  ranking: number | undefined;
  discountRate: number | undefined;

  // 관계 정보
  districtId: string | undefined;
  medicalSpecialtyIds: string[] | undefined;

  // JSON 정보
  prices: PriceInfo | undefined;
  detailedOpeningHours: OpeningHoursInfo | undefined;
};

export type FormErrors = {
  [K in keyof HospitalFormData]?: string;
} & {
  // 중첩된 객체의 에러
  'name.ko_KR'?: string;
  'name.en_US'?: string;
  'name.th_TH'?: string;
  'address.ko_KR'?: string;
  'address.en_US'?: string;
  'address.th_TH'?: string;
  'directions.ko_KR'?: string;
  'directions.en_US'?: string;
  'directions.th_TH'?: string;
  'description.ko_KR'?: string;
  'description.en_US'?: string;
  'description.th_TH'?: string;
  'openingHours.ko_KR'?: string;
  'openingHours.en_US'?: string;
  'openingHours.th_TH'?: string;
  'prices.minPrice'?: string;
  'prices.maxPrice'?: string;
};

export type HospitalForEdit = Hospital & {
  district?: Pick<District, 'id' | 'name' | 'countryCode'> | null;
  hospitalSpecialties?: HospitalMedicalSpecialtyForEdit[];
  hospitalImages?: HospitalImage[];
};

export interface MedicalSpecialty {
  id: string;
  name: LocalizedText;
  specialtyType: string;
  description?: LocalizedText;
  order?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalMedicalSpecialtyForEdit {
  id: string;
  hospitalId: string;
  medicalSpecialtyId: string;
  medicalSpecialty: MedicalSpecialty;
  createdAt: Date;
}

// 이미지 업로드 관련 타입들
export type HospitalImageType = 'MAIN' | 'THUMBNAIL' | 'PROMOTION' | 'DETAIL' | 'INTERIOR';

export interface HospitalImage {
  id: string;
  hospitalId: string;
  imageType: HospitalImageType;
  imageUrl: string;
  alt?: string;
  order?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageUploadRequest {
  hospitalId: string;
  imageType: HospitalImageType;
  file: File;
  alt?: string;
  order?: number;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl?: string;
  hospitalImage?: HospitalImage;
  error?: string;
}

export interface DeleteImageRequest {
  hospitalId: string;
  imageId: string;
}

// 이미지 타입별 제한 설정
export const IMAGE_TYPE_LIMITS: Record<HospitalImageType, number> = {
  MAIN: 1,
  THUMBNAIL: 1,
  PROMOTION: 1,
  DETAIL: 5,
  INTERIOR: 4,
} as const;

export const IMAGE_TYPE_LABELS: Record<HospitalImageType, string> = {
  MAIN: '대표 이미지',
  THUMBNAIL: '썸네일 이미지',
  PROMOTION: '프로모션 이미지',
  DETAIL: '상세 이미지',
  INTERIOR: '내부 이미지',
} as const;

export interface UpdateHospitalRequest {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  directions: LocalizedText;
  phoneNumber: string;
  description: LocalizedText;
  openingHours: LocalizedText;
  email: string;
  memo: string;
  ranking?: number;
  discountRate?: number;
  districtId?: string;
  prices?: PriceInfo;
  detailedOpeningHours?: OpeningHoursInfo;
  medicalSpecialtyIds?: string[];
}

export interface GetHospitalByIdRequest {
  id: string;
}

export interface GetHospitalByIdResponse {
  hospital: HospitalForEdit;
}
