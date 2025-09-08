import { InvitationCodeKind } from '@/lib/types/common';

/**
 * 초대코드 자동 생성 함수
 */
export function generateInvitationCode(kind: InvitationCodeKind): string {
  const prefix = kind === InvitationCodeKind.VIP ? 'VIP' : 'PAY';
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomString}`;
}

/**
 * 만료일 계산 함수
 */
export function calculateExpiresAt(kind: InvitationCodeKind, days: number = 30): Date | null {
  if (kind === InvitationCodeKind.VIP) {
    return null; // VIP는 만료 없음
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
