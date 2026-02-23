/**
 * 한국 공휴일 판별 및 다음 영업일 계산
 * 날짜는 한국 시간(Asia/Seoul) 기준으로 해석합니다.
 */

const TIME_ZONE = 'Asia/Seoul';

/** YYYY-MM-DD 형식의 한국 공휴일 목록 (대체공휴일 포함) */
const KOREAN_PUBLIC_HOLIDAYS: ReadonlySet<string> = new Set([
  // 2025
  '2025-01-01', // 신정
  '2025-01-28', '2025-01-29', '2025-01-30', // 설날 연휴 (1/29 설날)
  '2025-03-01', // 삼일절
  '2025-03-03', // 삼일절 대체공휴일
  '2025-05-05', // 어린이날
  '2025-05-24', // 부처님오신날
  '2025-05-26', // 부처님오신날 대체공휴일
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-08-18', // 광복절 대체공휴일 (8/15가 토요일)
  '2025-10-03', // 추석 10/3
  '2025-10-04', '2025-10-05', // 추석 연휴 (10/4 추석)
  '2025-10-06', // 개천절 대체공휴일
  '2025-10-09', // 한글날
  '2025-12-25', // 성탄절
  // 2026 (제공된 목록)
  '2026-01-01', // 신정
  '2026-02-16', '2026-02-17', '2026-02-18', // 설날 연휴
  '2026-03-01', // 삼일절
  '2026-03-02', // 삼일절 대체공휴일
  '2026-05-05', // 어린이날
  '2026-05-24', // 부처님오신날
  '2026-05-25', // 부처님오신날 대체공휴일
  '2026-06-03', // 전국동시지방선거일
  '2026-06-06', // 현충일
  '2026-07-17', // 제헌절
  '2026-08-15', // 광복절
  '2026-08-17', // 광복절 대체공휴일
  '2026-09-24', '2026-09-25', '2026-09-26', // 추석 연휴
  '2026-10-03', // 개천절
  '2026-10-05', // 개천절 대체공휴일
  '2026-10-09', // 한글날
  '2026-12-25', // 성탄절
]);

/**
 * 정렬된 한국 공휴일 목록(YYYY-MM-DD)을 반환합니다.
 * 관리자 화면 등에서 연도별 표시용으로 사용합니다.
 */
export function getKoreanPublicHolidayDates(): string[] {
  return Array.from(KOREAN_PUBLIC_HOLIDAYS).sort();
}

/**
 * Date를 지정한 시간대 기준 YYYY-MM-DD 문자열로 반환합니다.
 */
function toKoreaDateString(date: Date, timeZone: string = TIME_ZONE): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

/**
 * 주어진 날짜(한국 시간 기준)가 한국 공휴일인지 여부를 반환합니다.
 */
export function isKoreanPublicHoliday(date: Date, timeZone: string = TIME_ZONE): boolean {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const str = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  return KOREAN_PUBLIC_HOLIDAYS.has(str);
}

/**
 * 1=월요일, 7=일요일 (한국 시간 기준 해당일의 요일)
 */
function getDayOfWeekInKorea(date: Date, timeZone: string = TIME_ZONE): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  });
  const short = formatter.format(date);
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[short] ?? 1;
}

/**
 * fromDate(한국 시간 기준) 다음 날부터 순회하여
 * "평일(월~금)이면서 공휴일이 아닌" 첫 날의 0시 0분 0초(한국 시간)를 Date로 반환합니다.
 * fromDate는 포함하지 않고, 그 다음 날부터 검사합니다.
 */
export function getNextBusinessDayInKorea(
  fromDate: Date,
  timeZone: string = TIME_ZONE,
): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(fromDate);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const year = parseInt(getPart('year'), 10);
  const month = parseInt(getPart('month'), 10);
  const day = parseInt(getPart('day'), 10);
  const start = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+09:00`);

  for (let i = 1; i <= 14; i++) {
    const next = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const nextStr = toKoreaDateString(next, timeZone);
    if (KOREAN_PUBLIC_HOLIDAYS.has(nextStr)) continue;
    const dow = getDayOfWeekInKorea(next, timeZone);
    if (dow >= 1 && dow <= 5) {
      return new Date(`${nextStr}T00:00:00+09:00`);
    }
  }
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}
