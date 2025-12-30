import { type HospitalLocale } from '../ui/LanguageTabs';

/**
 * HospitalLocale을 언어 코드로 변환합니다.
 * @param locale - 변환할 로케일
 * @returns 언어 코드 ('ko' | 'en' | 'th' | 'zh')
 */
export function localeToLangCode(locale: HospitalLocale): 'ko' | 'en' | 'th' | 'zh' {
  if (locale === 'ko_KR') return 'ko';
  if (locale === 'en_US') return 'en';
  if (locale === 'th_TH') return 'th';
  return 'zh';
}
