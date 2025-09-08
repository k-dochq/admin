import type { InvitationCodeKind, ApiResponse } from './common';

export interface InvitationCode {
  id: string;
  code: string;
  kind: InvitationCodeKind;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  UsedBy?: {
    id: string;
    email: string | null;
    displayName: string | null;
  } | null;
}

export interface CreateInvitationCodeRequest {
  kind: InvitationCodeKind;
  expiresInDays?: number; // PAYMENT_REFERENCE 타입일 때만 사용, 기본값 30
}

export type CreateInvitationCodeResponse = ApiResponse<InvitationCode>;
export type InvitationCodesResponse = ApiResponse<InvitationCode[]>;
