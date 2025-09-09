'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type LocalizedText, type FormErrors } from '../api/entities/types';

interface DetailInfoSectionProps {
  directions: LocalizedText;
  description: LocalizedText;
  openingHours: LocalizedText;
  memo: string;
  errors: FormErrors;
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
  onUpdateDirections,
  onUpdateDescription,
  onUpdateOpeningHours,
  onUpdateMemo,
}: DetailInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>상세 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 길찾기 */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>길찾기</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='directions_ko'>한국어</Label>
              <Textarea
                id='directions_ko'
                value={directions.ko_KR || ''}
                onChange={(e) => onUpdateDirections('ko_KR', e.target.value)}
                placeholder='길찾기 정보 (한국어)'
                rows={3}
              />
              {errors['directions.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['directions.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='directions_en'>영어</Label>
              <Textarea
                id='directions_en'
                value={directions.en_US || ''}
                onChange={(e) => onUpdateDirections('en_US', e.target.value)}
                placeholder='Directions (English)'
                rows={3}
              />
              {errors['directions.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['directions.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='directions_th'>태국어</Label>
              <Textarea
                id='directions_th'
                value={directions.th_TH || ''}
                onChange={(e) => onUpdateDirections('th_TH', e.target.value)}
                placeholder='การเดินทาง (ไทย)'
                rows={3}
              />
              {errors['directions.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['directions.th_TH']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 병원 설명 */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>병원 설명</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='description_ko'>한국어</Label>
              <Textarea
                id='description_ko'
                value={description.ko_KR || ''}
                onChange={(e) => onUpdateDescription('ko_KR', e.target.value)}
                placeholder='병원 설명 (한국어)'
                rows={4}
              />
              {errors['description.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['description.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='description_en'>영어</Label>
              <Textarea
                id='description_en'
                value={description.en_US || ''}
                onChange={(e) => onUpdateDescription('en_US', e.target.value)}
                placeholder='Hospital Description (English)'
                rows={4}
              />
              {errors['description.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['description.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='description_th'>태국어</Label>
              <Textarea
                id='description_th'
                value={description.th_TH || ''}
                onChange={(e) => onUpdateDescription('th_TH', e.target.value)}
                placeholder='คำอธิบายโรงพยาบาล (ไทย)'
                rows={4}
              />
              {errors['description.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['description.th_TH']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 진료시간 (다국어) */}
        <div className='space-y-4'>
          <h3 className='text-sm font-medium'>진료시간 (텍스트)</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='openingHours_ko'>한국어</Label>
              <Textarea
                id='openingHours_ko'
                value={openingHours.ko_KR || ''}
                onChange={(e) => onUpdateOpeningHours('ko_KR', e.target.value)}
                placeholder='진료시간 (한국어)'
                rows={3}
              />
              {errors['openingHours.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['openingHours.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='openingHours_en'>영어</Label>
              <Textarea
                id='openingHours_en'
                value={openingHours.en_US || ''}
                onChange={(e) => onUpdateOpeningHours('en_US', e.target.value)}
                placeholder='Opening Hours (English)'
                rows={3}
              />
              {errors['openingHours.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['openingHours.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='openingHours_th'>태국어</Label>
              <Textarea
                id='openingHours_th'
                value={openingHours.th_TH || ''}
                onChange={(e) => onUpdateOpeningHours('th_TH', e.target.value)}
                placeholder='เวลาทำการ (ไทย)'
                rows={3}
              />
              {errors['openingHours.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['openingHours.th_TH']}</p>
              )}
            </div>
          </div>
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
