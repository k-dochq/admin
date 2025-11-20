'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type DoctorFormErrors } from '../model/types';

interface DoctorGenderFieldProps {
  genderType: 'MALE' | 'FEMALE';
  errors: DoctorFormErrors;
  onUpdate: (value: 'MALE' | 'FEMALE') => void;
}

export function DoctorGenderField({ genderType, errors, onUpdate }: DoctorGenderFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='gender'>성별 *</Label>
      <Select value={genderType} onValueChange={onUpdate}>
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
  );
}
