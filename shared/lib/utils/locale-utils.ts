import { type HospitalLocale, LOCALE_TO_LANG_CODE_MAP, type LocalizedText } from '../types/locale';
import { type Prisma } from '@prisma/client';

/**
 * HospitalLocale을 언어 코드로 변환합니다.
 * @param locale - 변환할 로케일
 * @returns 언어 코드 ('ko' | 'en' | 'th' | 'zh' | 'ja')
 */
export function localeToLangCode(locale: HospitalLocale): 'ko' | 'en' | 'th' | 'zh' | 'ja' | 'hi' {
  return LOCALE_TO_LANG_CODE_MAP[locale];
}

/**
 * Prisma JsonValue를 LocalizedText로 변환합니다.
 * @param jsonValue - 변환할 Prisma JsonValue
 * @returns LocalizedText 객체
 */
export function parseLocalizedText(jsonValue: Prisma.JsonValue | null | undefined): LocalizedText {
  if (!jsonValue) {
    return {};
  }

  if (typeof jsonValue === 'object' && jsonValue !== null && !Array.isArray(jsonValue)) {
    return jsonValue as LocalizedText;
  }

  return {};
}

/**
 * LocalizedText에서 특정 로케일의 텍스트를 가져옵니다.
 * @param text - LocalizedText 객체
 * @param locale - 가져올 로케일
 * @returns 해당 로케일의 텍스트 또는 빈 문자열
 */
export function getLocalizedText(
  text: LocalizedText | null | undefined,
  locale: HospitalLocale,
): string {
  if (!text) {
    return '';
  }
  return text[locale] || '';
}

/**
 * LocalizedText에서 첫 번째로 사용 가능한 텍스트를 가져옵니다.
 * 우선순위: ko_KR > en_US > th_TH > zh_TW > ja_JP
 * @param text - LocalizedText 객체
 * @returns 첫 번째로 사용 가능한 텍스트 또는 빈 문자열
 */
export function getFirstAvailableText(text: LocalizedText | null | undefined): string {
  if (!text) {
    return '';
  }
  return text.ko_KR || text.en_US || text.th_TH || text.zh_TW || text.ja_JP || text.hi_IN || '';
}

/**
 * Prisma JsonValue에서 특정 로케일의 텍스트를 가져옵니다.
 * @param jsonValue - Prisma JsonValue
 * @param locale - 가져올 로케일
 * @returns 해당 로케일의 텍스트 또는 빈 문자열
 */
export function getLocalizedTextFromJson(
  jsonValue: Prisma.JsonValue | null | undefined,
  locale: HospitalLocale,
): string {
  const localizedText = parseLocalizedText(jsonValue);
  return getLocalizedText(localizedText, locale);
}

/**
 * LocalizedText를 Prisma JsonValue로 변환합니다.
 * @param text - LocalizedText 객체
 * @returns Prisma JsonValue
 */
export function localizeTextToJsonValue(text: LocalizedText): Prisma.JsonValue {
  return text;
}
