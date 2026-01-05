/**
 * 공통 로케일 타입 정의
 * 모든 다국어 필드에서 사용하는 공통 타입과 상수
 */

export type HospitalLocale = 'ko_KR' | 'en_US' | 'th_TH' | 'zh_TW' | 'ja_JP';

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
};

/**
 * 로케일을 언어 코드로 매핑
 */
export const LOCALE_TO_LANG_CODE_MAP: Record<HospitalLocale, 'ko' | 'en' | 'th' | 'zh' | 'ja'> = {
  ko_KR: 'ko',
  en_US: 'en',
  th_TH: 'th',
  zh_TW: 'zh',
  ja_JP: 'ja',
};

/**
 * 모든 로케일 목록
 */
export const ALL_LOCALES: HospitalLocale[] = ['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP'];
