'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type HospitalLocale = 'ko_KR' | 'en_US' | 'th_TH';

export const HOSPITAL_LOCALE_LABELS: Record<HospitalLocale, string> = {
  ko_KR: '한국어',
  en_US: 'English',
  th_TH: 'ไทย',
};

export const HOSPITAL_LOCALE_FLAGS: Record<HospitalLocale, string> = {
  ko_KR: '🇰🇷',
  en_US: '🇺🇸',
  th_TH: '🇹🇭',
};

interface LanguageTabsProps {
  value: HospitalLocale;
  onValueChange: (value: HospitalLocale) => void;
}

export function LanguageTabs({ value, onValueChange }: LanguageTabsProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onValueChange(val as HospitalLocale)}>
      <TabsList className='grid w-full max-w-md grid-cols-3'>
        {(['ko_KR', 'en_US', 'th_TH'] as const).map((locale) => (
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
