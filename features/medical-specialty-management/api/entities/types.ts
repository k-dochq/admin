import { type LocalizedText } from '@/shared/lib/types/locale';

export type { LocalizedText };

export interface CreateMedicalSpecialtyRequest {
  parentSpecialtyId: string;
  name: LocalizedText;
  description?: LocalizedText;
  order?: number;
  isActive?: boolean;
}

export interface UpdateMedicalSpecialtyRequest {
  name?: LocalizedText;
  description?: LocalizedText;
  order?: number;
  isActive?: boolean;
}
