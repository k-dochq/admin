import { LiveReview, Hospital, MedicalSpecialty, Prisma } from '@prisma/client';

// 요청 타입들
export interface GetLiveReviewsRequest {
  page?: number;
  limit?: number;
  hospitalId?: string; // 병원 필터
  medicalSpecialtyId?: string; // 시술부위 필터
  isActive?: boolean; // 활성화 여부 필터
}

export interface UpdateLiveReviewRequest {
  content?: Prisma.JsonValue;
  detailLink?: string | null;
  order?: number | null;
  isActive?: boolean;
  medicalSpecialtyId?: string;
  hospitalId?: string;
}

export interface CreateLiveReviewRequest {
  content: Prisma.JsonValue;
  detailLink?: string | null;
  order?: number | null;
  isActive?: boolean;
  medicalSpecialtyId: string;
  hospitalId: string;
}

// 응답 타입들
export interface GetLiveReviewsResponse {
  liveReviews: LiveReviewForList[];
  total: number;
  page: number;
  limit: number;
}

// 도메인 엔티티 타입들
export type LiveReviewForList = LiveReview & {
  hospital: Pick<Hospital, 'id' | 'name'>;
  medicalSpecialty: Pick<MedicalSpecialty, 'id' | 'name' | 'specialtyType'>;
  liveReviewImages: Array<{
    id: string;
    imageUrl: string;
    order: number | null;
  }>;
  _count: {
    liveReviewImages: number;
  };
};

export type LiveReviewDetail = LiveReview & {
  hospital: Pick<Hospital, 'id' | 'name'>;
  medicalSpecialty: Pick<MedicalSpecialty, 'id' | 'name' | 'specialtyType'>;
  liveReviewImages: Array<{
    id: string;
    liveReviewId: string;
    imageUrl: string;
    alt: string | null;
    order: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
};
