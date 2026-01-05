import { localeToLangCode as sharedLocaleToLangCode } from '@/shared/lib/utils/locale-utils';
import { type HospitalLocale } from '../ui/LanguageTabs';

/**
 * HospitalLocale을 언어 코드로 변환합니다.
 * @param locale - 변환할 로케일
 * @returns 언어 코드 ('ko' | 'en' | 'th' | 'zh' | 'ja')
 * @deprecated 공통 유틸리티 함수를 직접 사용하세요: @/shared/lib/utils/locale-utils
 */
export function localeToLangCode(locale: HospitalLocale): 'ko' | 'en' | 'th' | 'zh' | 'ja' {
  return sharedLocaleToLangCode(locale);
}
