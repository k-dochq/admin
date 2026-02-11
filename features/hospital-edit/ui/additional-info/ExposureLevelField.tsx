'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExposureLevelFieldProps {
  value?: 'Public' | 'Hidden';
  onChange?: (value: 'Public' | 'Hidden') => void;
}

export function ExposureLevelField({ value = 'Public', onChange }: ExposureLevelFieldProps) {
  return (
    <div>
      <Label htmlFor='exposureLevel'>노출레벨</Label>
      <Select value={value} onValueChange={(v) => onChange?.(v as 'Public' | 'Hidden')}>
        <SelectTrigger>
          <SelectValue placeholder='노출레벨을 선택하세요' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='Public'>Public</SelectItem>
          <SelectItem value='Hidden'>Hidden</SelectItem>
        </SelectContent>
      </Select>
      <p className='text-muted-foreground mt-1 text-sm'>Public: 노출, Hidden: 비노출</p>
    </div>
  );
}
