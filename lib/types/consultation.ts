import { type Prisma } from '@prisma/client';

// 다국어 텍스트 타입 (k-doc에서 복사)
export interface LocalizedText {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
}

// Prisma JsonValue를 LocalizedText로 변환하는 헬퍼 함수
export function parseLocalizedText(jsonValue: Prisma.JsonValue): LocalizedText {
  if (typeof jsonValue === 'object' && jsonValue !== null) {
    return jsonValue as LocalizedText;
  }
  return {};
}

// LocalizedText에서 한국어 텍스트를 추출하는 함수 (admin은 한국어만 사용)
export function getKoreanText(text: LocalizedText): string {
  return text.ko_KR || text.en_US || text.th_TH || '';
}

// 상담 채팅방 타입
export interface ChatRoom {
  hospitalId: string;
  hospitalName: LocalizedText;
  hospitalThumbnailUrl?: string;
  districtName?: LocalizedText;
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
      };
    };
  };
}>;

// 병원 이미지 타입
export type HospitalImageType = 'MAIN' | 'THUMBNAIL' | 'PROMOTION' | 'DETAIL' | 'INTERIOR';

// 메시지 발신자 타입
export type SenderType = 'USER' | 'ADMIN';
