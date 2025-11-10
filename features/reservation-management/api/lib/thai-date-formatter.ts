/**
 * 태국어 날짜 포맷팅 유틸리티
 * 태국은 불교력을 사용하므로 서기 연도로 직접 포맷팅
 */

/**
 * 태국어 월 이름 배열
 */
const THAI_MONTHS = [
  'มกราคม', // January
  'กุมภาพันธ์', // February
  'มีนาคม', // March
  'เมษายน', // April
  'พฤษภาคม', // May
  'มิถุนายน', // June
  'กรกฎาคม', // July
  'สิงหาคม', // August
  'กันยายน', // September
  'ตุลาคม', // October
  'พฤศจิกายน', // November
  'ธันวาคม', // December
] as const;

/**
 * 날짜를 태국어 형식으로 포맷팅 (DD/MM/YYYY)
 * @param date - 포맷팅할 날짜
 * @returns DD/MM/YYYY 형식의 문자열
 * @example
 * formatThaiDate(new Date('2025-11-29')) // '29/11/2025'
 */
export function formatThaiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/**
 * 날짜를 태국어 형식으로 포맷팅 (일 월이름 연도)
 * @param date - 포맷팅할 날짜
 * @returns 일 월이름 연도 형식의 문자열
 * @example
 * formatThaiDateWithMonthName(new Date('2025-11-19')) // '19 พฤศจิกายน 2025'
 */
export function formatThaiDateWithMonthName(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return `${day} ${THAI_MONTHS[month]} ${year}`;
}
