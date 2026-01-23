import { getFirstAvailableText, parseLocalizedText } from '@/shared/lib/utils/locale-utils';
import type { Prisma } from '@prisma/client';

/**
 * 다국어 JSON 텍스트에서 로컬라이즈된 텍스트 추출
 * @deprecated 공통 유틸리티 함수를 직접 사용하세요: getFirstAvailableText, parseLocalizedText
 */
export function getLocalizedText(jsonText: unknown): string {
  if (typeof jsonText === 'string') return jsonText;
  const localizedText = parseLocalizedText(jsonText as Prisma.JsonValue);
  return getFirstAvailableText(localizedText);
}

/**
 * 평점을 별점으로 렌더링하는 컴포넌트용 데이터 생성
 */
export function getRatingStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => ({
    index: i + 1,
    filled: i + 1 <= rating,
  }));
}
