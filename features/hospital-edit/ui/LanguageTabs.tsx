'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type HospitalLocale,
  HOSPITAL_LOCALE_LABELS,
  HOSPITAL_LOCALE_FLAGS,
  ALL_LOCALES,
} from '@/shared/lib/types/locale';

/**
 * 다국어 필드 타입
 * 모든 로케일에 대한 문자열 값을 포함합니다.
 */
export type MultilingualField = Record<HospitalLocale, string>;

/**
 * 다국어 필드 업데이트 콜백 타입
 */
export type MultilingualFieldUpdateCallback = (field: HospitalLocale, value: string) => void;

// 공통 타입과 상수를 재export
export type { HospitalLocale };
export { HOSPITAL_LOCALE_LABELS, HOSPITAL_LOCALE_FLAGS };

interface LanguageTabsProps {
  value: HospitalLocale;
  onValueChange: (value: HospitalLocale) => void;
}

export function LanguageTabs({ value, onValueChange }: LanguageTabsProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onValueChange(val as HospitalLocale)}>
      <TabsList className='grid w-full max-w-md grid-cols-6'>
        {ALL_LOCALES.map((locale) => (
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
