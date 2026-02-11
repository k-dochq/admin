'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type DistrictForForm, type FormErrors } from '../../api/entities/types';

interface DistrictFieldProps {
  districtId: string | undefined;
  districts: DistrictForForm[];
  isLoadingDistricts: boolean;
  errors: FormErrors;
  onUpdateDistrictId: (value: string | undefined) => void;
}

export function DistrictField({
  districtId,
  districts,
  isLoadingDistricts,
  errors,
  onUpdateDistrictId,
}: DistrictFieldProps) {
  return (
    <div>
      <Label htmlFor='districtId'>지역</Label>
      <Select
        value={districtId || 'none'}
        onValueChange={(value) => onUpdateDistrictId(value === 'none' ? undefined : value)}
        disabled={isLoadingDistricts}
      >
        <SelectTrigger>
          <SelectValue placeholder='지역을 선택하세요' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='none'>지역 없음</SelectItem>
          {districts.map((district) => (
            <SelectItem key={district.id} value={district.id}>
              {district.name} ({district.countryCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.districtId && (
        <p className='text-destructive mt-1 text-sm'>{errors.districtId}</p>
      )}
    </div>
  );
}
