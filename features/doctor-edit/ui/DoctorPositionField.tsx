'use client';

import { Input } from '@/components/ui/input';
import { type DoctorFormData, type DoctorFormErrors } from '../model/types';
import { type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';

interface DoctorPositionFieldProps {
  position: DoctorFormData['position'];
  errors: DoctorFormErrors;
  selectedLocale: HospitalLocale;
  onUpdate: (locale: HospitalLocale, value: string) => void;
}

const getPlaceholder = (locale: HospitalLocale) => {
  if (locale === 'ko_KR') return '예: 주치의, 과장';
  if (locale === 'en_US') return 'e.g. Doctor, Chief';
  return 'เช่น แพทย์, หัวหน้า';
};

export function DoctorPositionField({
  position,
  errors,
  selectedLocale,
  onUpdate,
}: DoctorPositionFieldProps) {
  const positionTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: position[selectedLocale] || '',
    onUpdate,
    fieldName: 'position',
  });

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-medium'>직책</h3>
      <div className='relative'>
        <Input
          id={`position_${selectedLocale}`}
          value={position[selectedLocale] || ''}
          onChange={(e) => onUpdate(selectedLocale, e.target.value)}
          placeholder={getPlaceholder(selectedLocale)}
          disabled={positionTranslation.isTranslating}
          className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
        />
        {selectedLocale !== 'ko_KR' && (
          <div className='absolute top-1/2 right-2 -translate-y-1/2'>
            <TranslateButton
              onClick={positionTranslation.handleTranslate}
              disabled={!positionTranslation.canTranslate}
              isTranslating={positionTranslation.isTranslating}
            />
          </div>
        )}
      </div>
      {errors[`position.${selectedLocale}` as keyof DoctorFormErrors] && (
        <p className='text-destructive mt-1 text-sm'>
          {errors[`position.${selectedLocale}` as keyof DoctorFormErrors]}
        </p>
      )}
    </div>
  );
}
