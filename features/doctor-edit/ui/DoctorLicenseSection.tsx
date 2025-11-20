'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type DoctorFormErrors } from '../model/types';

interface DoctorLicenseSectionProps {
  licenseNumber: string;
  licenseDate: Date | undefined;
  errors: DoctorFormErrors;
  onUpdateLicenseNumber: (value: string) => void;
  onUpdateLicenseDate: (date: Date | undefined) => void;
}

export function DoctorLicenseSection({
  licenseNumber,
  licenseDate,
  errors,
  onUpdateLicenseNumber,
  onUpdateLicenseDate,
}: DoctorLicenseSectionProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {/* 면허번호 */}
      <div className='space-y-2'>
        <Label htmlFor='license-number'>면허번호</Label>
        <Input
          id='license-number'
          value={licenseNumber}
          onChange={(e) => onUpdateLicenseNumber(e.target.value)}
          placeholder='면허번호를 입력하세요'
          className={errors.licenseNumber ? 'border-destructive' : ''}
        />
        {errors.licenseNumber && <p className='text-destructive text-sm'>{errors.licenseNumber}</p>}
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
                !licenseDate && 'text-muted-foreground',
                errors.licenseDate && 'border-destructive',
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {licenseDate ? format(licenseDate, 'PPP', { locale: ko }) : '날짜를 선택하세요'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <div className='p-4'>
              <Calendar
                mode='single'
                selected={licenseDate}
                onSelect={onUpdateLicenseDate}
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
  );
}
