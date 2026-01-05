import { type Prisma, type MedicalSpecialtyType } from '@prisma/client';
import { type LocalizedText } from '@/shared/lib/types/locale';
import {
  parseLocalizedText as sharedParseLocalizedText,
  getFirstAvailableText,
} from '@/shared/lib/utils/locale-utils';

// 다국어 텍스트 타입 (공통 타입 사용)
export type { LocalizedText };

// Prisma JsonValue를 LocalizedText로 변환하는 헬퍼 함수
export function parseLocalizedText(jsonValue: Prisma.JsonValue): LocalizedText {
  return sharedParseLocalizedText(jsonValue);
}

// LocalizedText에서 한국어 텍스트를 추출하는 함수 (admin은 한국어만 사용)
export function getKoreanText(text: LocalizedText): string {
  return getFirstAvailableText(text);
}

// 상담 채팅방 타입
export interface ChatRoom {
  hospitalId: string;
  hospitalName: LocalizedText;
  hospitalThumbnailUrl?: string;
  districtName?: LocalizedText;
  medicalSpecialties?: Array<{
    id: string;
    specialtyType: MedicalSpecialtyType;
    name: LocalizedText;
  }>;
  lastMessageContent?: string;
  lastMessageDate?: string;
  lastMessageSenderType?: 'USER' | 'ADMIN';
  unreadCount?: number;
  userId: string;
  userDisplayName?: string;
}

// Prisma 타입을 활용한 상담 메시지 타입
export type ConsultationMessageWithRelations = Prisma.ConsultationMessageGetPayload<{
  include: {
    User: {
      select: {
        id: true;
        displayName: true;
        name: true;
      };
    };
    Hospital: {
      include: {
        district: true;
        hospitalImages: {
          where: {
            imageType: 'THUMBNAIL';
            isActive: true;
          };
          orderBy: {
            order: 'asc';
          };
          take: 1;
        };
        hospitalSpecialties: {
          include: {
            medicalSpecialty: true;
          };
        };
      };
    };
  };
}>;

// 병원 이미지 타입
export type HospitalImageType = 'MAIN' | 'THUMBNAIL' | 'PROMOTION' | 'DETAIL' | 'INTERIOR';

// 메시지 발신자 타입
export type SenderType = 'USER' | 'ADMIN';

// 페이지네이션 타입
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
}

// 페이지네이션된 채팅방 목록 응답 타입
export interface PaginatedChatRoomsResponse {
  chatRooms: ChatRoom[];
  pagination: PaginationInfo;
}
