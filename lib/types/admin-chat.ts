import { type Prisma } from '@prisma/client';

// 채팅 메시지 타입 (admin 관점)
export type AdminChatMessageType = 'USER' | 'ADMIN';

export interface AdminChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: AdminChatMessageType;
  senderType: AdminChatMessageType; // DB의 senderType과 매핑
}

// 타이핑 이벤트
export interface AdminTypingEvent {
  userId: string;
  userName: string;
  isTyping: boolean;
  isAdmin?: boolean; // admin이 타이핑 중인지 구분
}

// 채팅방 상태
export interface AdminChatRoomState {
  isConnected: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  typingUsers: string[];
}

// 채팅 액션
export interface AdminChatActions {
  sendMessage: (content: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => Promise<void>;
  refreshHistory: () => Promise<void>;
  clearError: () => void;
}

// 채팅 메타데이터
export interface AdminChatMetadata {
  roomId: string;
  channelName: string;
  hospitalId: string;
  userId: string; // 대화 상대방 사용자 ID
  adminName: string; // 현재 admin 이름
}

// 통합 admin 채팅 훅 반환 타입
export interface UseAdminRealtimeChatReturn
  extends AdminChatRoomState,
    AdminChatActions,
    AdminChatMetadata {
  messages: AdminChatMessage[];
}

// 메시지 검증 결과
export interface AdminMessageValidationResult {
  isValid: boolean;
  error?: string;
}

// API 응답 타입
export interface AdminChatApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 채팅 히스토리 API 응답 (Prisma 타입 활용)
export type AdminChatHistoryMessage = Prisma.ConsultationMessageGetPayload<{
  include: {
    User: {
      select: {
        id: true;
        displayName: true;
        name: true;
      };
    };
  };
}>;

export interface AdminChatHistoryResponse {
  messages: AdminChatHistoryMessage[];
}

// 브로드캐스트 메시지
export interface AdminBroadcastMessage {
  type: 'broadcast';
  event: 'message' | 'typing';
  payload: AdminChatMessage | AdminTypingEvent;
}
