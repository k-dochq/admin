/**
 * 자동응답·공휴일 안내 패널용: 현재 시점 기준 상태·언어별 메시지·공휴일 목록을 한 번에 계산합니다.
 * 클라이언트(브라우저)에서 호출 가능합니다.
 * 일과시간 외 / 공휴일 두 종류 메시지를 모두 계산해 패널에서 둘 다 표시할 수 있게 합니다.
 */

import { checkBusinessHoursInKorea } from './business-hours-utils';
import { getKoreanPublicHolidayDates, getNextBusinessDayInKorea } from './korean-holidays';
import { getAutoResponseMessage } from './auto-response-utils';
import { formatNextBusinessDayForLanguage } from './next-business-day-format';
import { AUTO_RESPONSE_MESSAGES } from './auto-response-messages';
import type { AutoResponseLanguage } from './auto-response-messages';

export interface AutoResponseInfo {
  isBusinessHours: boolean;
  isPublicHoliday: boolean;
  currentTime: string;
  nextBusinessDay: Date | null;
  nextBusinessDayFormattedByLocale: Record<string, string>;
  /** 일과시간 외(평일 저녁/주말)일 때 사용되는 메시지 - 언어별 */
  offHoursMessagesByLanguage: Record<string, string>;
  /** 공휴일일 때 사용되는 메시지(재개일 치환됨) - 언어별 */
  holidayMessagesByLanguage: Record<string, string>;
  supportedLanguages: string[];
  holidayList: string[];
}

const SUPPORTED_LANGUAGES = Object.keys(AUTO_RESPONSE_MESSAGES) as AutoResponseLanguage[];

/**
 * 현재 시점(한국 시간) 기준으로 자동응답 안내에 필요한 모든 값을 계산합니다.
 * 일과시간 외 메시지와 공휴일 메시지를 둘 다 계산해 반환합니다.
 */
export function computeAutoResponseInfo(): AutoResponseInfo {
  const {
    isBusinessHours,
    isPublicHoliday,
    currentTime,
    nextBusinessDay,
    todayKorea,
  } = checkBusinessHoursInKorea();

  // 공휴일이면 nextBusinessDay 사용, 아니면 오늘 다음의 다음 영업일(표시용) 사용
  const dateForHolidayMessage =
    nextBusinessDay ?? getNextBusinessDayInKorea(todayKorea);

  const nextBusinessDayFormattedByLocale: Record<string, string> = {};
  const offHoursMessagesByLanguage: Record<string, string> = {};
  const holidayMessagesByLanguage: Record<string, string> = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    nextBusinessDayFormattedByLocale[lang] = formatNextBusinessDayForLanguage(
      dateForHolidayMessage,
      lang,
    );
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    offHoursMessagesByLanguage[lang] = getAutoResponseMessage(lang);
    holidayMessagesByLanguage[lang] = getAutoResponseMessage(lang, {
      isPublicHoliday: true,
      nextBusinessDayFormatted: nextBusinessDayFormattedByLocale[lang],
    });
  }

  return {
    isBusinessHours,
    isPublicHoliday,
    currentTime,
    nextBusinessDay: nextBusinessDay ?? null,
    nextBusinessDayFormattedByLocale,
    offHoursMessagesByLanguage,
    holidayMessagesByLanguage,
    supportedLanguages: [...SUPPORTED_LANGUAGES],
    holidayList: getKoreanPublicHolidayDates(),
  };
}
