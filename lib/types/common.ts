// 초대코드 타입
export enum InvitationCodeKind {
  VIP = 'VIP',
  PAYMENT_REFERENCE = 'PAYMENT_REFERENCE',
}

// 공통 API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
