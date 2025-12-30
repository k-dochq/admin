import { Prisma } from '@prisma/client';

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
};

export interface HospitalCategory {
  id: string;
  name: Prisma.JsonValue;
  description?: Prisma.JsonValue | null;
  order?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    hospitals: number;
  };
}

export interface GetHospitalCategoriesResponse {
  categories: HospitalCategory[];
}

export interface CreateHospitalCategoryRequest {
  name: LocalizedText;
  description?: LocalizedText;
  order?: number;
  isActive?: boolean;
}

export interface UpdateHospitalCategoryRequest {
  name?: LocalizedText;
  description?: LocalizedText;
  order?: number;
  isActive?: boolean;
}
