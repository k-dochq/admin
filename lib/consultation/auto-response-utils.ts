/**
 * 자동 응답 메시지 생성 유틸리티
 * 언어 코드에 따라 적절한 메시지를 반환합니다.
 * 일과시간 외 / 공휴일 메시지를 구분합니다.
 */

import {
  AUTO_RESPONSE_MESSAGES,
  AUTO_RESPONSE_HOLIDAY_MESSAGES,
  NEXT_BUSINESS_DAY_PLACEHOLDER,
  type AutoResponseLanguage,
} from './auto-response-messages';

export interface GetAutoResponseMessageOptions {
  isPublicHoliday?: boolean;
  nextBusinessDayFormatted?: string;
}

/**
 * 언어에 해당하는 자동 응답 메시지를 반환합니다.
 * 공휴일인 경우 nextBusinessDayFormatted로 플레이스홀더를 치환한 공휴일 전용 메시지를 반환합니다.
 */
export function getAutoResponseMessage(
  language: AutoResponseLanguage,
  options?: GetAutoResponseMessageOptions,
): string {
  if (
    options?.isPublicHoliday === true &&
    options?.nextBusinessDayFormatted != null &&
    options.nextBusinessDayFormatted !== ''
  ) {
    const template = AUTO_RESPONSE_HOLIDAY_MESSAGES[language];
    return template.replace(NEXT_BUSINESS_DAY_PLACEHOLDER, options.nextBusinessDayFormatted);
  }
  return AUTO_RESPONSE_MESSAGES[language];
}

/**
 * 언어 코드가 유효한 자동 응답 메시지를 가지고 있는지 확인합니다.
 */
export function hasAutoResponseMessage(language: string): language is AutoResponseLanguage {
  return language in AUTO_RESPONSE_MESSAGES;
}
