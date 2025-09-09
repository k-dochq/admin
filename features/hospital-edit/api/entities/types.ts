import { Hospital, District } from '@prisma/client';

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

export type HospitalForEdit = Hospital & {
  district?: Pick<District, 'id' | 'name' | 'countryCode'> | null;
};

export interface UpdateHospitalRequest {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  directions?: LocalizedText;
  phoneNumber?: string;
  description?: LocalizedText;
  openingHours?: LocalizedText;
  email?: string;
  memo?: string;
  ranking?: number;
  discountRate?: number;
  districtId?: string;
}

export interface GetHospitalByIdRequest {
  id: string;
}

export interface GetHospitalByIdResponse {
  hospital: HospitalForEdit;
}
