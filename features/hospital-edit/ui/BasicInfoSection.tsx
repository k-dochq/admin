'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type LocalizedText, type FormErrors } from '../api/entities/types';

interface BasicInfoSectionProps {
  name: LocalizedText;
  address: LocalizedText;
  phoneNumber: string;
  email: string;
  errors: FormErrors;
  onUpdateName: (field: keyof LocalizedText, value: string) => void;
  onUpdateAddress: (field: keyof LocalizedText, value: string) => void;
  onUpdatePhoneNumber: (value: string) => void;
  onUpdateEmail: (value: string) => void;
}

export function BasicInfoSection({
  name,
  address,
  phoneNumber,
  email,
  errors,
  onUpdateName,
  onUpdateAddress,
  onUpdatePhoneNumber,
  onUpdateEmail,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 병원명 */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>병원명</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='name_ko'>한국어</Label>
              <Input
                id='name_ko'
                value={name.ko_KR || ''}
                onChange={(e) => onUpdateName('ko_KR', e.target.value)}
                placeholder='병원명 (한국어)'
              />
              {errors['name.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='name_en'>영어</Label>
              <Input
                id='name_en'
                value={name.en_US || ''}
                onChange={(e) => onUpdateName('en_US', e.target.value)}
                placeholder='Hospital Name (English)'
              />
              {errors['name.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='name_th'>태국어</Label>
              <Input
                id='name_th'
                value={name.th_TH || ''}
                onChange={(e) => onUpdateName('th_TH', e.target.value)}
                placeholder='ชื่อโรงพยาบาล (ไทย)'
              />
              {errors['name.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.th_TH']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 주소 */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>주소</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='address_ko'>한국어</Label>
              <Input
                id='address_ko'
                value={address.ko_KR || ''}
                onChange={(e) => onUpdateAddress('ko_KR', e.target.value)}
                placeholder='주소 (한국어)'
              />
              {errors['address.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['address.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='address_en'>영어</Label>
              <Input
                id='address_en'
                value={address.en_US || ''}
                onChange={(e) => onUpdateAddress('en_US', e.target.value)}
                placeholder='Address (English)'
              />
              {errors['address.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['address.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='address_th'>태국어</Label>
              <Input
                id='address_th'
                value={address.th_TH || ''}
                onChange={(e) => onUpdateAddress('th_TH', e.target.value)}
                placeholder='ที่อยู่ (ไทย)'
              />
              {errors['address.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['address.th_TH']}</p>
              )}
            </div>
          </div>
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
