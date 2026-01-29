/**
 * 공통 로케일 타입 정의
 * 모든 다국어 필드에서 사용하는 공통 타입과 상수
 */

export type HospitalLocale = 'ko_KR' | 'en_US' | 'th_TH' | 'zh_TW' | 'ja_JP' | 'hi_IN' | 'tl_PH' | 'ar_SA';

/**
 * 다국어 텍스트 타입
 * 모든 로케일에 대한 문자열 값을 포함합니다.
 */
export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
  zh_TW?: string;
  ja_JP?: string;
  hi_IN?: string;
  tl_PH?: string;
  ar_SA?: string;
};

/**
 * 로케일별 라벨
 */
export const HOSPITAL_LOCALE_LABELS: Record<HospitalLocale, string> = {
  ko_KR: '한국어',
  en_US: 'English',
  th_TH: 'ไทย',
  zh_TW: '繁體中文',
  ja_JP: '日本語',
  hi_IN: 'हिन्दी',
  tl_PH: 'Filipino',
  ar_SA: 'العربية',
};

/**
 * 로케일별 플래그 이모지
 */
export const HOSPITAL_LOCALE_FLAGS: Record<HospitalLocale, string> = {
  ko_KR: '🇰🇷',
  en_US: '🇺🇸',
  th_TH: '🇹🇭',
  zh_TW: '🇹🇼',
  ja_JP: '🇯🇵',
  hi_IN: '🇮🇳',
  tl_PH: '🇵🇭',
  ar_SA: '🇸🇦',
};

/**
 * 로케일을 언어 코드로 매핑
 */
export const LOCALE_TO_LANG_CODE_MAP: Record<
  HospitalLocale,
  'ko' | 'en' | 'th' | 'zh' | 'ja' | 'hi' | 'tl' | 'ar'
> = {
  ko_KR: 'ko',
  en_US: 'en',
  th_TH: 'th',
  zh_TW: 'zh',
  ja_JP: 'ja',
  hi_IN: 'hi',
  tl_PH: 'tl',
  ar_SA: 'ar',
};

/**
 * 모든 로케일 목록
 */
export const ALL_LOCALES: HospitalLocale[] = ['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'];

/**
 * Short Locale (이미지/썸네일용 7개 코드)
 * LOCALE_TO_LANG_CODE_MAP 값 타입과 동일. Prisma YoutubeVideoLocale, EventBannerLocale과 값 집합 동일.
 */
export type ShortLocale = (typeof LOCALE_TO_LANG_CODE_MAP)[HospitalLocale];

/** ShortLocale별 라벨 — HOSPITAL_LOCALE_LABELS에서 파생 */
export const SHORT_LOCALE_LABELS: Record<ShortLocale, string> = ALL_LOCALES.reduce(
  (acc, loc) => {
    acc[LOCALE_TO_LANG_CODE_MAP[loc]] = HOSPITAL_LOCALE_LABELS[loc];
    return acc;
  },
  {} as Record<ShortLocale, string>,
);

/** ShortLocale별 플래그 — HOSPITAL_LOCALE_FLAGS에서 파생 */
export const SHORT_LOCALE_FLAGS: Record<ShortLocale, string> = ALL_LOCALES.reduce(
  (acc, loc) => {
    acc[LOCALE_TO_LANG_CODE_MAP[loc]] = HOSPITAL_LOCALE_FLAGS[loc];
    return acc;
  },
  {} as Record<ShortLocale, string>,
);

/** ShortLocale 전체 목록 — ALL_LOCALES 순서 유지 */
export const ALL_SHORT_LOCALES: ShortLocale[] = ALL_LOCALES.map(
  (loc) => LOCALE_TO_LANG_CODE_MAP[loc],
);
