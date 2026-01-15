import { Prisma } from '@prisma/client';

/**
 * 다국어 JSON 텍스트에서 로컬라이즈된 텍스트 추출
 */
export function getLocalizedText(jsonText: Prisma.JsonValue | null | undefined): string {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (
      (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
    );
  }
  return '';
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
