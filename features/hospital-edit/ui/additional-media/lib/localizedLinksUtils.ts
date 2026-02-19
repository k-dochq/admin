import type { HospitalLocale } from '../../LanguageTabs';
import { ALL_LOCALES } from '@/shared/lib/types/locale';

const FALLBACK_ORDER: HospitalLocale[] = [
  'en_US',
  'ko_KR',
  'th_TH',
  'zh_TW',
  'ja_JP',
  'hi_IN',
  'tl_PH',
  'ar_SA',
  'ru_RU',
];

/**
 * localizedLinks(언어별 URL)에서 대표 fallback URL 하나를 뽑는다.
 * API/DB 저장 시 단일 imageUrl 필드에 넣을 값으로 사용.
 */
export function getFallbackUrlFromLocalizedLinks(
  localizedLinks: Record<string, string | undefined> | null | undefined,
): string {
  if (!localizedLinks || typeof localizedLinks !== 'object') return '';
  for (const locale of FALLBACK_ORDER) {
    const url = localizedLinks[locale];
    if (typeof url === 'string' && url.trim() !== '') return url.trim();
  }
  return '';
}

/**
 * Record<HospitalLocale, string>을 LocalizedText로 변환 (빈 문자열은 제외)
 */
export function toLocalizedText(
  record: Record<HospitalLocale, string>,
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const locale of ALL_LOCALES) {
    const value = record[locale]?.trim();
    if (value) result[locale] = value;
  }
  return result;
}
