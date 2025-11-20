'use client';

import { Input } from '@/components/ui/input';
import { type DoctorFormData, type DoctorFormErrors } from '../model/types';
import { type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';

interface DoctorNameFieldProps {
  name: DoctorFormData['name'];
  errors: DoctorFormErrors;
  selectedLocale: HospitalLocale;
  onUpdate: (locale: HospitalLocale, value: string) => void;
}

const getPlaceholder = (locale: HospitalLocale) => {
  if (locale === 'ko_KR') return '한국어 이름';
  if (locale === 'en_US') return 'English name';
  return 'ชื่อภาษาไทย';
};

export function DoctorNameField({ name, errors, selectedLocale, onUpdate }: DoctorNameFieldProps) {
  const nameTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: name.ko_KR || '',
    onUpdate,
    fieldName: 'name',
  });

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-medium'>이름 *</h3>
      <div className='relative'>
        <Input
          id={`name_${selectedLocale}`}
          value={name[selectedLocale] || ''}
          onChange={(e) => onUpdate(selectedLocale, e.target.value)}
          placeholder={getPlaceholder(selectedLocale)}
          disabled={nameTranslation.isTranslating}
          className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
        />
        {selectedLocale !== 'ko_KR' && (
          <div className='absolute top-1/2 right-2 -translate-y-1/2'>
            <TranslateButton
              onClick={nameTranslation.handleTranslate}
              disabled={!nameTranslation.canTranslate}
              isTranslating={nameTranslation.isTranslating}
            />
          </div>
        )}
      </div>
      {errors[`name.${selectedLocale}` as keyof DoctorFormErrors] && (
        <p className='text-destructive mt-1 text-sm'>
          {errors[`name.${selectedLocale}` as keyof DoctorFormErrors]}
        </p>
      )}
    </div>
  );
}
