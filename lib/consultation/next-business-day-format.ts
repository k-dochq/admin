/**
 * 다음 영업일(재개일)을 언어별로 포맷합니다.
 * date는 한국 시간 기준 해당일 0시로 해석됩니다.
 */

import type { AutoResponseLanguage } from './auto-response-messages';

const TIME_ZONE = 'Asia/Seoul';

const LOCALE_BY_LANG: Record<AutoResponseLanguage, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  th: 'th-TH',
  'zh-Hant': 'zh-TW',
  ja: 'ja-JP',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ru: 'ru-RU',
  tl: 'en-US',
};

/**
 * 언어별로 "○월 ○일(요일)" 형식의 재개일 문자열을 반환합니다.
 * 예: ko → "5월 5일 (월)", en → "May 5 (Monday)"
 */
export function formatNextBusinessDayForLanguage(
  date: Date,
  lang: AutoResponseLanguage,
): string {
  const locale = LOCALE_BY_LANG[lang];
  const month = new Intl.DateTimeFormat(locale, {
    timeZone: TIME_ZONE,
    month: 'long',
  }).format(date);
  const day = new Intl.DateTimeFormat(locale, {
    timeZone: TIME_ZONE,
    day: 'numeric',
  }).format(date);
  const weekday = new Intl.DateTimeFormat(locale, {
    timeZone: TIME_ZONE,
    weekday: lang === 'ja' ? 'short' : lang === 'ko' ? 'short' : 'long',
  }).format(date);

  switch (lang) {
    case 'ko':
      return `${month} ${day}일 (${weekday})`;
    case 'zh-Hant':
      return `${month}${day}日（${weekday}）`;
    case 'ja':
      return `${month}${day}日（${weekday}）`;
    case 'en':
    case 'tl':
      return `${month} ${day} (${weekday})`;
    case 'th':
    case 'hi':
    case 'ar':
    case 'ru':
    default:
      return `${day} ${month} (${weekday})`;
  }
}
