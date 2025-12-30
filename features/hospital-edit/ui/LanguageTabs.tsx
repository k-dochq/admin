'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type HospitalLocale = 'ko_KR' | 'en_US' | 'th_TH' | 'zh_TW';

/**
 * 다국어 필드 타입
 * 모든 로케일에 대한 문자열 값을 포함합니다.
 */
export type MultilingualField = Record<HospitalLocale, string>;

/**
 * 다국어 필드 업데이트 콜백 타입
 */
export type MultilingualFieldUpdateCallback = (field: HospitalLocale, value: string) => void;

export const HOSPITAL_LOCALE_LABELS: Record<HospitalLocale, string> = {
  ko_KR: '한국어',
  en_US: 'English',
  th_TH: 'ไทย',
  zh_TW: '繁體中文',
};

export const HOSPITAL_LOCALE_FLAGS: Record<HospitalLocale, string> = {
  ko_KR: '🇰🇷',
  en_US: '🇺🇸',
  th_TH: '🇹🇭',
  zh_TW: '🇹🇼',
};

interface LanguageTabsProps {
  value: HospitalLocale;
  onValueChange: (value: HospitalLocale) => void;
}

export function LanguageTabs({ value, onValueChange }: LanguageTabsProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onValueChange(val as HospitalLocale)}>
      <TabsList className='grid w-full max-w-md grid-cols-4'>
        {(['ko_KR', 'en_US', 'th_TH', 'zh_TW'] as const).map((locale) => (
          <TabsTrigger key={locale} value={locale} className='text-sm'>
            <span>
              {HOSPITAL_LOCALE_FLAGS[locale]} {HOSPITAL_LOCALE_LABELS[locale]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
