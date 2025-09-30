import {
  Review,
  Hospital,
  User,
  MedicalSpecialty,
  Prisma,
  UserRoleType,
  UserGenderType,
  UserLocale,
  UserStatusType,
} from '@prisma/client';

// 요청 타입들
export interface GetReviewsRequest {
  page?: number;
  limit?: number;
  search?: string;
  hospitalId?: string; // 병원 필터
  medicalSpecialtyId?: string; // 시술부위 필터
  rating?: number; // 평점 필터
  isRecommended?: boolean; // 추천 여부 필터
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: Prisma.JsonValue;
  content?: Prisma.JsonValue;
  concernsMultilingual?: Prisma.JsonValue;
  isRecommended?: boolean;
  medicalSpecialtyId?: string;
  hospitalId?: string;
}

export interface CreateReviewRequest {
  rating: number;
  title: Prisma.JsonValue;
  content: Prisma.JsonValue;
  concernsMultilingual: Prisma.JsonValue;
  isRecommended: boolean;
  medicalSpecialtyId: string;
  hospitalId: string;
  userId?: string;
  userData?: {
    name?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    drRoleType?: UserRoleType;
    genderType?: UserGenderType;
    locale?: UserLocale;
    age?: number;
    userStatusType?: UserStatusType;
    advertPush?: boolean;
    communityAlarm?: boolean;
    postAlarm?: boolean;
    collectPersonalInfo?: boolean;
    profileImgUrl?: string;
  } | null;
}

// 응답 타입들
export interface GetReviewsResponse {
  reviews: ReviewForList[];
  total: number;
  page: number;
  limit: number;
}

// 도메인 엔티티 타입들
export type ReviewForList = Review & {
  user: Pick<User, 'id' | 'name' | 'email'>;
  hospital: Pick<Hospital, 'id' | 'name'>;
  medicalSpecialty: Pick<MedicalSpecialty, 'id' | 'name' | 'specialtyType'>;
  reviewImages: Array<{
    id: string;
    imageType: 'BEFORE' | 'AFTER';
    imageUrl: string;
    order: number | null;
  }>;
  _count: {
    reviewImages: number;
  };
};

export type ReviewDetail = Review & {
  user: Pick<User, 'id' | 'name' | 'email'>;
  hospital: Pick<Hospital, 'id' | 'name'>;
  medicalSpecialty: Pick<MedicalSpecialty, 'id' | 'name' | 'specialtyType'>;
  reviewImages: Array<{
    id: string;
    reviewId: string;
    imageType: 'BEFORE' | 'AFTER';
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
};
