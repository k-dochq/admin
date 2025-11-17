import { Prisma } from '@prisma/client';

// Prisma 타입 기반 메모 타입
export type ConsultationMemoWithRelations = Prisma.ConsultationMemoGetPayload<{
  include: {
    User: {
      select: {
        id: true;
        displayName: true;
        name: true;
      };
    };
    Hospital: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}> & {
  Creator?: {
    id: string;
    email: string | null;
    name: string | null;
    displayName: string | null;
  } | null;
};

// 메모 목록 조회 요청
export interface GetConsultationMemosRequest {
  userId: string;
  hospitalId: string;
}

// 메모 생성 요청
export interface CreateConsultationMemoRequest {
  userId: string;
  hospitalId: string;
  content: string;
}

// 메모 수정 요청
export interface UpdateConsultationMemoRequest {
  content?: string;
  isPinned?: boolean;
  isCompleted?: boolean;
}

// 메모 상단 고정 토글 요청
export interface ToggleMemoPinRequest {
  isPinned: boolean;
}

// 메모 완료 처리 토글 요청
export interface ToggleMemoCompleteRequest {
  isCompleted: boolean;
}

// 메모 응답
export interface ConsultationMemoResponse {
  success: boolean;
  data?: ConsultationMemoWithRelations;
  error?: string;
}

// 메모 목록 응답
export interface ConsultationMemoListResponse {
  success: boolean;
  data?: {
    memos: ConsultationMemoWithRelations[];
  };
  error?: string;
}

// 날짜별 그룹화된 메모
export interface GroupedConsultationMemo {
  date: string; // YYYY-MM-DD 형식 또는 'pinned'
  memos: ConsultationMemoWithRelations[];
}

// API 응답 타입
export interface ConsultationMemoApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
