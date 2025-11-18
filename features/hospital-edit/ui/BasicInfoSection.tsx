'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type LocalizedText, type FormErrors } from '../api/entities/types';
import { type HospitalLocale } from './LanguageTabs';
import { TranslateButton } from './TranslateButton';
import { useLocalizedFieldTranslation } from '../model/useLocalizedFieldTranslation';

interface BasicInfoSectionProps {
  name: LocalizedText;
  address: LocalizedText;
  displayLocationName: LocalizedText;
  phoneNumber: string;
  email: string;
  errors: FormErrors;
  selectedLocale: HospitalLocale;
  onUpdateName: (field: keyof LocalizedText, value: string) => void;
  onUpdateAddress: (field: keyof LocalizedText, value: string) => void;
  onUpdateDisplayLocationName: (field: keyof LocalizedText, value: string) => void;
  onUpdatePhoneNumber: (value: string) => void;
  onUpdateEmail: (value: string) => void;
}

export function BasicInfoSection({
  name,
  address,
  displayLocationName,
  phoneNumber,
  email,
  errors,
  selectedLocale,
  onUpdateName,
  onUpdateAddress,
  onUpdateDisplayLocationName,
  onUpdatePhoneNumber,
  onUpdateEmail,
}: BasicInfoSectionProps) {
  // 각 필드별 번역 훅 - 입력란의 현재 텍스트를 소스로 사용
  const nameTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: name[selectedLocale] || '',
    onUpdate: onUpdateName,
    fieldName: 'name',
  });

  const addressTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: address[selectedLocale] || '',
    onUpdate: onUpdateAddress,
    fieldName: 'address',
  });

  const displayLocationNameTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: displayLocationName[selectedLocale] || '',
    onUpdate: onUpdateDisplayLocationName,
    fieldName: 'displayLocationName',
  });

  const getPlaceholder = (field: string) => {
    if (selectedLocale === 'ko_KR') {
      return {
        name: '병원명 (한국어)',
        address: '주소 (한국어)',
        displayLocationName: '표시 지역명 (한국어)',
      }[field];
    } else if (selectedLocale === 'en_US') {
      return {
        name: 'Hospital Name (English)',
        address: 'Address (English)',
        displayLocationName: 'Display Location Name (English)',
      }[field];
    } else {
      return {
        name: 'ชื่อโรงพยาบาล (ไทย)',
        address: 'ที่อยู่ (ไทย)',
        displayLocationName: 'ชื่อตำแหน่งที่แสดง (ไทย)',
      }[field];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 병원명 */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>병원명</h3>
          <div className='relative'>
            <Input
              id={`name_${selectedLocale}`}
              value={name[selectedLocale] || ''}
              onChange={(e) => onUpdateName(selectedLocale, e.target.value)}
              placeholder={getPlaceholder('name')}
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
          {errors[`name.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`name.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 주소 */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>주소</h3>
          <div className='relative'>
            <Input
              id={`address_${selectedLocale}`}
              value={address[selectedLocale] || ''}
              onChange={(e) => onUpdateAddress(selectedLocale, e.target.value)}
              placeholder={getPlaceholder('address')}
              disabled={addressTranslation.isTranslating}
              className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
            />
            {selectedLocale !== 'ko_KR' && (
              <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                <TranslateButton
                  onClick={addressTranslation.handleTranslate}
                  disabled={!addressTranslation.canTranslate}
                  isTranslating={addressTranslation.isTranslating}
                />
              </div>
            )}
          </div>
          {errors[`address.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`address.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 표시 지역명 */}
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>표시 지역명</h3>
          <p className='text-muted-foreground text-xs'>
            사용자에게 표시될 간소화된 지역명입니다. (예: 강남, 청담, 압구정 등)
          </p>
          <div className='relative'>
            <Input
              id={`displayLocationName_${selectedLocale}`}
              value={displayLocationName[selectedLocale] || ''}
              onChange={(e) => onUpdateDisplayLocationName(selectedLocale, e.target.value)}
              placeholder={getPlaceholder('displayLocationName')}
              disabled={displayLocationNameTranslation.isTranslating}
              className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
            />
            {selectedLocale !== 'ko_KR' && (
              <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                <TranslateButton
                  onClick={displayLocationNameTranslation.handleTranslate}
                  disabled={!displayLocationNameTranslation.canTranslate}
                  isTranslating={displayLocationNameTranslation.isTranslating}
                />
              </div>
            )}
          </div>
          {errors[`displayLocationName.${selectedLocale}` as keyof FormErrors] && (
            <p className='text-destructive mt-1 text-sm'>
              {errors[`displayLocationName.${selectedLocale}` as keyof FormErrors]}
            </p>
          )}
        </div>

        {/* 연락처 정보 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='phoneNumber'>전화번호</Label>
            <Input
              id='phoneNumber'
              value={phoneNumber}
              onChange={(e) => onUpdatePhoneNumber(e.target.value)}
              placeholder='전화번호'
            />
            {errors.phoneNumber && (
              <p className='text-destructive mt-1 text-sm'>{errors.phoneNumber}</p>
            )}
          </div>
          <div>
            <Label htmlFor='email'>이메일</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => onUpdateEmail(e.target.value)}
              placeholder='이메일 주소'
            />
            {errors.email && <p className='text-destructive mt-1 text-sm'>{errors.email}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
