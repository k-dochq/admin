import { Hospital, District, HospitalApprovalStatusType } from '@prisma/client';

// 요청 타입들
export interface GetHospitalsRequest {
  page?: number;
  limit?: number;
  search?: string;
  approvalStatus?: HospitalApprovalStatusType;
  districtId?: string;
  enableJp?: boolean;
  hasClone?: boolean;
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
};

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};
