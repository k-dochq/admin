import { Prisma } from '@prisma/client';
import { type LocalizedText } from '@/shared/lib/types/locale';

export type { LocalizedText };

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
