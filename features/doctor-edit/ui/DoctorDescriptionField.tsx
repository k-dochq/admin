'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type DoctorFormErrors } from '../model/types';

interface DoctorDescriptionFieldProps {
  description: string;
  errors: DoctorFormErrors;
  onUpdate: (value: string) => void;
}

export function DoctorDescriptionField({
  description,
  errors,
  onUpdate,
}: DoctorDescriptionFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='description'>설명</Label>
      <Textarea
        id='description'
        value={description}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder='의사에 대한 설명을 입력하세요'
        rows={4}
        className={errors.description ? 'border-destructive' : ''}
      />
      {errors.description && <p className='text-destructive text-sm'>{errors.description}</p>}
    </div>
  );
}
