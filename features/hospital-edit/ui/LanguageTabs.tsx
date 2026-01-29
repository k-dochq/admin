'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
    <div className='flex flex-col gap-2'>
      <Label htmlFor='locale-select' className='text-muted-foreground text-sm'>
        편집할 언어
      </Label>
      <Select value={value} onValueChange={(val) => onValueChange(val as HospitalLocale)}>
        <SelectTrigger id='locale-select' className='w-[220px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALL_LOCALES.map((locale) => (
            <SelectItem key={locale} value={locale}>
              <span>
                {HOSPITAL_LOCALE_FLAGS[locale]} {HOSPITAL_LOCALE_LABELS[locale]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
