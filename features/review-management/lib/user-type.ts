export type ReviewUserType = 'real' | 'admin';

/**
 * 관리자 생성 사용자로 분류되는 이메일 suffix 목록
 *
 * - admin API(`app/api/admin/reviews/route.ts`)의 userType 필터와 동일 기준을 유지해야 함
 * - UI에서도 같은 기준으로 '실제 사용자 / 관리자 생성' 표시
 */
export const ADMIN_GENERATED_EMAIL_SUFFIXES = ['@example.com', '@dummy.com'] as const;

export const REVIEW_USER_TYPE_LABEL: Record<ReviewUserType, string> = {
  real: '실제 사용자',
  admin: '관리자 생성',
} as const;

export const REVIEW_USER_TYPE_FILTER_OPTIONS = [
  { value: 'real', label: REVIEW_USER_TYPE_LABEL.real },
  { value: 'admin', label: REVIEW_USER_TYPE_LABEL.admin },
] as const satisfies ReadonlyArray<{ value: ReviewUserType; label: string }>;

export function isAdminGeneratedUserEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_GENERATED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

export function getReviewUserTypeFromEmail(email?: string | null): ReviewUserType {
  return isAdminGeneratedUserEmail(email) ? 'admin' : 'real';
}

export function getReviewUserTypeLabel(type: ReviewUserType): string {
  return REVIEW_USER_TYPE_LABEL[type];
}

