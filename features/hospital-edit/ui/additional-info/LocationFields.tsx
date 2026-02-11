'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type FormErrors } from '../../api/entities/types';

interface LocationFieldsProps {
  latitude: number | undefined;
  longitude: number | undefined;
  errors: FormErrors;
  onUpdateLatitude: (value: number | undefined) => void;
  onUpdateLongitude: (value: number | undefined) => void;
}

export function LocationFields({
  latitude,
  longitude,
  errors,
  onUpdateLatitude,
  onUpdateLongitude,
}: LocationFieldsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div>
        <Label htmlFor='latitude'>위도 (Latitude)</Label>
        <Input
          id='latitude'
          type='number'
          step='any'
          placeholder='위도 입력 (예: 37.5665)'
          value={latitude?.toString() || ''}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateLatitude(value === '' ? undefined : Number(value));
          }}
        />
        {errors.latitude && <p className='text-destructive mt-1 text-sm'>{errors.latitude}</p>}
        <p className='text-muted-foreground mt-1 text-sm'>
          -90 ~ 90 사이의 값입니다. (예: 37.5665)
        </p>
      </div>
      <div>
        <Label htmlFor='longitude'>경도 (Longitude)</Label>
        <Input
          id='longitude'
          type='number'
          step='any'
          placeholder='경도 입력 (예: 126.9780)'
          value={longitude?.toString() || ''}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateLongitude(value === '' ? undefined : Number(value));
          }}
        />
        {errors.longitude && (
          <p className='text-destructive mt-1 text-sm'>{errors.longitude}</p>
        )}
        <p className='text-muted-foreground mt-1 text-sm'>
          -180 ~ 180 사이의 값입니다. (예: 126.9780)
        </p>
      </div>
    </div>
  );
}
