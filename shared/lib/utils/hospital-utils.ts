import { Prisma } from '@prisma/client';

/**
 * Prisma.JsonValue에서 한국어 텍스트를 추출하는 헬퍼 함수
 */
function extractKoreanName(name: Prisma.JsonValue): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
    const textObj = name as Record<string, unknown>;
    return (textObj['ko_KR'] as string) || (textObj['ko'] as string) || '';
  }
  return '';
}

/**
 * 병원 목록을 가나다순으로 정렬하는 함수
 * @param hospitals - 정렬할 병원 배열
 * @returns 가나다순으로 정렬된 병원 배열의 복사본
 */
export function sortHospitalsByName<T extends { name: Prisma.JsonValue }>(hospitals: T[]): T[] {
  return [...hospitals].sort((a, b) => {
    const nameA = extractKoreanName(a.name) || '';
    const nameB = extractKoreanName(b.name) || '';
    return nameA.localeCompare(nameB, 'ko');
  });
}
