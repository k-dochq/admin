'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type DoctorFormData, type DoctorFormErrors } from '../model/types';

interface DoctorBasicInfoSectionProps {
  formData: DoctorFormData;
  errors: DoctorFormErrors;
  onUpdateField: <K extends keyof DoctorFormData>(field: K, value: DoctorFormData[K]) => void;
  onUpdateNestedField: <K extends keyof DoctorFormData>(
    field: K,
    nestedField: string,
    value: string,
  ) => void;
  isEditMode: boolean;
}

export function DoctorBasicInfoSection({
  formData,
  errors,
  onUpdateField,
  onUpdateNestedField,
  isEditMode,
}: DoctorBasicInfoSectionProps) {
  const handleNameChange = (locale: string, value: string) => {
    onUpdateNestedField('name', locale, value);
  };

  const handlePositionChange = (locale: string, value: string) => {
    onUpdateNestedField('position', locale, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 이름 (다국어) */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>이름 *</Label>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='name-ko'>한국어</Label>
              <Input
                id='name-ko'
                value={formData.name.ko_KR || ''}
                onChange={(e) => handleNameChange('ko_KR', e.target.value)}
                placeholder='한국어 이름'
                className={errors['name.ko_KR'] ? 'border-destructive' : ''}
              />
              {errors['name.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='name-en'>영어</Label>
              <Input
                id='name-en'
                value={formData.name.en_US || ''}
                onChange={(e) => handleNameChange('en_US', e.target.value)}
                placeholder='English name'
                className={errors['name.en_US'] ? 'border-destructive' : ''}
              />
              {errors['name.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='name-th'>태국어</Label>
              <Input
                id='name-th'
                value={formData.name.th_TH || ''}
                onChange={(e) => handleNameChange('th_TH', e.target.value)}
                placeholder='ชื่อภาษาไทย'
                className={errors['name.th_TH'] ? 'border-destructive' : ''}
              />
              {errors['name.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['name.th_TH']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 직책 (다국어) */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>직책</Label>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <Label htmlFor='position-ko'>한국어</Label>
              <Input
                id='position-ko'
                value={formData.position.ko_KR || ''}
                onChange={(e) => handlePositionChange('ko_KR', e.target.value)}
                placeholder='예: 주치의, 과장'
                className={errors['position.ko_KR'] ? 'border-destructive' : ''}
              />
              {errors['position.ko_KR'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['position.ko_KR']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='position-en'>영어</Label>
              <Input
                id='position-en'
                value={formData.position.en_US || ''}
                onChange={(e) => handlePositionChange('en_US', e.target.value)}
                placeholder='e.g. Doctor, Chief'
                className={errors['position.en_US'] ? 'border-destructive' : ''}
              />
              {errors['position.en_US'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['position.en_US']}</p>
              )}
            </div>
            <div>
              <Label htmlFor='position-th'>태국어</Label>
              <Input
                id='position-th'
                value={formData.position.th_TH || ''}
                onChange={(e) => handlePositionChange('th_TH', e.target.value)}
                placeholder='เช่น แพทย์, หัวหน้า'
                className={errors['position.th_TH'] ? 'border-destructive' : ''}
              />
              {errors['position.th_TH'] && (
                <p className='text-destructive mt-1 text-sm'>{errors['position.th_TH']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 성별 */}
        <div className='space-y-2'>
          <Label htmlFor='gender'>성별 *</Label>
          <Select
            value={formData.genderType}
            onValueChange={(value: 'MALE' | 'FEMALE') => onUpdateField('genderType', value)}
          >
            <SelectTrigger className={errors.genderType ? 'border-destructive' : ''}>
              <SelectValue placeholder='성별을 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='MALE'>남성</SelectItem>
              <SelectItem value='FEMALE'>여성</SelectItem>
            </SelectContent>
          </Select>
          {errors.genderType && <p className='text-destructive text-sm'>{errors.genderType}</p>}
        </div>

        {/* 설명 */}
        <div className='space-y-2'>
          <Label htmlFor='description'>설명</Label>
          <Textarea
            id='description'
            value={formData.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            placeholder='의사에 대한 설명을 입력하세요'
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className='text-destructive text-sm'>{errors.description}</p>}
        </div>

        {/* 면허 정보 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* 면허번호 */}
          <div className='space-y-2'>
            <Label htmlFor='license-number'>면허번호</Label>
            <Input
              id='license-number'
              value={formData.licenseNumber}
              onChange={(e) => onUpdateField('licenseNumber', e.target.value)}
              placeholder='면허번호를 입력하세요'
              className={errors.licenseNumber ? 'border-destructive' : ''}
            />
            {errors.licenseNumber && (
              <p className='text-destructive text-sm'>{errors.licenseNumber}</p>
            )}
          </div>

          {/* 면허 취득일 */}
          <div className='space-y-2'>
            <Label>면허 취득일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.licenseDate && 'text-muted-foreground',
                    errors.licenseDate && 'border-destructive',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {formData.licenseDate
                    ? format(formData.licenseDate, 'PPP', { locale: ko })
                    : '날짜를 선택하세요'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <div className='p-4'>
                  <Calendar
                    mode='single'
                    selected={formData.licenseDate}
                    onSelect={(date) => onUpdateField('licenseDate', date)}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                    locale={ko}
                    className='[--cell-size:2.75rem]'
                    classNames={{
                      month: 'space-y-4',
                      caption: 'flex justify-center pt-1 relative items-center mb-4',
                      caption_label: 'text-sm font-medium',
                      nav: 'space-x-1 flex items-center',
                      table: 'w-full border-collapse space-y-1',
                      head_row: 'flex',
                      head_cell:
                        'text-muted-foreground rounded-md w-11 font-normal text-[0.8rem] flex-1 text-center',
                      row: 'flex w-full mt-2',
                      cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
                      day: cn(
                        'h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground',
                        'data-[today=true]:bg-accent data-[today=true]:text-accent-foreground',
                        'data-[outside=true]:text-muted-foreground data-[outside=true]:opacity-50',
                        'data-[disabled=true]:text-muted-foreground data-[disabled=true]:opacity-50',
                      ),
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
            {errors.licenseDate && <p className='text-destructive text-sm'>{errors.licenseDate}</p>}
          </div>
        </div>

        {/* 기타 설정 (수정 모드에서만) */}
        {isEditMode && (
          <div className='space-y-4 border-t pt-4'>
            <Label className='text-base font-medium'>기타 설정</Label>

            {/* 순서 */}
            <div className='space-y-2'>
              <Label htmlFor='order'>순서</Label>
              <Input
                id='order'
                type='number'
                min='0'
                value={formData.order || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdateField('order', value ? parseInt(value, 10) : undefined);
                }}
                placeholder='정렬 순서 (숫자)'
                className={errors.order ? 'border-destructive' : ''}
              />
              {errors.order && <p className='text-destructive text-sm'>{errors.order}</p>}
            </div>

            {/* 활동 상태 */}
            <div className='flex items-center space-x-2'>
              <Switch
                id='stop'
                checked={!formData.stop}
                onCheckedChange={(checked) => onUpdateField('stop', !checked)}
              />
              <Label htmlFor='stop'>활성 상태</Label>
            </div>

            {/* 승인 상태 */}
            <div className='space-y-2'>
              <Label htmlFor='approval-status'>승인 상태</Label>
              <Select
                value={formData.approvalStatusType}
                onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL') =>
                  onUpdateField('approvalStatusType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PENDING'>대기</SelectItem>
                  <SelectItem value='APPROVED'>승인</SelectItem>
                  <SelectItem value='REJECTED'>거부</SelectItem>
                  <SelectItem value='WAITING_APPROVAL'>승인대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
