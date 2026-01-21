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

/**
 * 병원 검색어 정규화
 *
 * 목표:
 * - 서버/DB 쿼리(where) 변경 없이, 케이스 민감한 `string_contains` 검색에서
 *   영문 병원명 케이스 차이로 인한 미매칭을 줄인다.
 *
 * 규칙:
 * - 앞뒤 공백 제거
 * - `@` 포함(이메일 검색 가능성)인 경우는 원본 유지 (케이스 변경으로 미매칭이 늘어날 수 있음)
 * - 영문자가 포함된 경우는 대문자화하여 전송 (예: v&mj -> V&MJ)
 */
export function normalizeHospitalSearchTerm(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // 이메일 검색은 케이스 변경이 오히려 미매칭을 만들 수 있어 그대로 유지
  if (trimmed.includes('@')) return trimmed;

  const hasEnglishChar = /[a-zA-Z]/.test(trimmed);
  return hasEnglishChar ? trimmed.toUpperCase() : trimmed;
}
