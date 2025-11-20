'use client';

import { Textarea } from '@/components/ui/textarea';
import { type DoctorFormData, type DoctorFormErrors } from '../model/types';
import { type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';

interface DoctorCareerFieldProps {
  career: DoctorFormData['career'];
  errors: DoctorFormErrors;
  selectedLocale: HospitalLocale;
  onUpdate: (locale: HospitalLocale, value: string) => void;
}

const getPlaceholder = (locale: HospitalLocale) => {
  if (locale === 'ko_KR') return '경력정보를 입력하세요 (한 줄씩 입력)';
  if (locale === 'en_US') return 'Enter career information (one line each)';
  return 'กรอกข้อมูลประวัติการทำงาน (บรรทัดละหนึ่งรายการ)';
};

export function DoctorCareerField({
  career,
  errors,
  selectedLocale,
  onUpdate,
}: DoctorCareerFieldProps) {
  const careerTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: career[selectedLocale] || '',
    onUpdate,
    fieldName: 'career',
  });

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-medium'>경력정보 (최대 10줄)</h3>
      <div className='relative'>
        <Textarea
          id={`career_${selectedLocale}`}
          value={career[selectedLocale] || ''}
          onChange={(e) => onUpdate(selectedLocale, e.target.value)}
          placeholder={getPlaceholder(selectedLocale)}
          rows={10}
          disabled={careerTranslation.isTranslating}
          className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
        />
        {selectedLocale !== 'ko_KR' && (
          <div className='absolute top-2 right-2'>
            <TranslateButton
              onClick={careerTranslation.handleTranslate}
              disabled={!careerTranslation.canTranslate}
              isTranslating={careerTranslation.isTranslating}
            />
          </div>
        )}
      </div>
      {errors[`career.${selectedLocale}` as keyof DoctorFormErrors] && (
        <p className='text-destructive mt-1 text-sm'>
          {errors[`career.${selectedLocale}` as keyof DoctorFormErrors]}
        </p>
      )}
    </div>
  );
}
