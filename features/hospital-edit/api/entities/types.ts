import { Hospital, District } from '@prisma/client';

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
  prices?: PriceInfo;
  detailedOpeningHours?: OpeningHoursInfo;
}

export interface GetHospitalByIdRequest {
  id: string;
}

export interface GetHospitalByIdResponse {
  hospital: HospitalForEdit;
}
