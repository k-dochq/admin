'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type LocalizedText, type FormErrors } from '../api/entities/types';
import { type HospitalLocale } from './LanguageTabs';

interface DetailInfoSectionProps {
  directions: LocalizedText;
  description: LocalizedText;
  openingHours: LocalizedText;
  memo: string;
  errors: FormErrors;
  selectedLocale: HospitalLocale;
  onUpdateDirections: (field: keyof LocalizedText, value: string) => void;
  onUpdateDescription: (field: keyof LocalizedText, value: string) => void;
  onUpdateOpeningHours: (field: keyof LocalizedText, value: string) => void;
  onUpdateMemo: (value: string) => void;
}

export function DetailInfoSection({
  directions,
  description,
  openingHours,
  memo,
  errors,
  selectedLocale,
  onUpdateDirections,
  onUpdateDescription,
  onUpdateOpeningHours,
  onUpdateMemo,
}: DetailInfoSectionProps) {
  const getPlaceholder = (field: string) => {
    if (selectedLocale === 'ko_KR') {
      return {
        directions: '길찾기 정보 (한국어)',
        description: '병원 설명 (한국어)',
        openingHours: '진료시간 (한국어)',
      }[field];
    } else if (selectedLocale === 'en_US') {
      return {
        directions: 'Directions (English)',
        description: 'Hospital Description (English)',
        openingHours: 'Opening Hours (English)',
      }[field];
    } else {
      return {
        directions: 'การเดินทาง (ไทย)',
        description: 'คำอธิบายโรงพยาบาล (ไทย)',
        openingHours: 'เวลาทำการ (ไทย)',
      }[field];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>상세 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 길찾기 */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>길찾기</h3>
          <Textarea
            id={`directions_${selectedLocale}`}
            value={directions[selectedLocale] || ''}
            onChange={(e) => onUpdateDirections(selectedLocale, e.target.value)}
            placeholder={getPlaceholder('directions')}
            rows={3}
          />
          {errors[`directions.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`directions.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 병원 설명 */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>병원 설명</h3>
          <Textarea
            id={`description_${selectedLocale}`}
            value={description[selectedLocale] || ''}
            onChange={(e) => onUpdateDescription(selectedLocale, e.target.value)}
            placeholder={getPlaceholder('description')}
            rows={4}
          />
          {errors[`description.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`description.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 진료시간 (다국어) */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>진료시간 (텍스트)</h3>
          <Textarea
            id={`openingHours_${selectedLocale}`}
            value={openingHours[selectedLocale] || ''}
            onChange={(e) => onUpdateOpeningHours(selectedLocale, e.target.value)}
            placeholder={getPlaceholder('openingHours')}
            rows={3}
          />
          {errors[`openingHours.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`openingHours.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 메모 */}
        <div>
          <Label htmlFor='memo'>메모</Label>
          <Textarea
            id='memo'
            value={memo}
            onChange={(e) => onUpdateMemo(e.target.value)}
            placeholder='내부 메모'
            rows={3}
          />
          {errors.memo && <p className='text-destructive mt-1 text-sm'>{errors.memo}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
