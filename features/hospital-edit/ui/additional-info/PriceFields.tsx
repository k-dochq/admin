'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type PriceInfo, type FormErrors } from '../../api/entities/types';

interface PriceFieldsProps {
  prices: PriceInfo | undefined;
  errors: FormErrors;
  onUpdatePrices: (prices: PriceInfo | undefined) => void;
}

export function PriceFields({ prices, errors, onUpdatePrices }: PriceFieldsProps) {
  const handleChange = (field: keyof PriceInfo, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const currentPrices = prices || {};
    onUpdatePrices({
      ...currentPrices,
      [field]: numValue,
    });
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div>
        <Label htmlFor='minPrice'>최소 가격 (달러)</Label>
        <Input
          id='minPrice'
          type='number'
          min='0'
          placeholder='최소 가격 입력'
          value={prices?.minPrice?.toString() || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
        {errors['prices.minPrice'] && (
          <p className='text-destructive mt-1 text-sm'>{errors['prices.minPrice']}</p>
        )}
      </div>
      <div>
        <Label htmlFor='maxPrice'>최대 가격 (달러)</Label>
        <Input
          id='maxPrice'
          type='number'
          min='0'
          placeholder='최대 가격 입력'
          value={prices?.maxPrice?.toString() || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
        {errors['prices.maxPrice'] && (
          <p className='text-destructive mt-1 text-sm'>{errors['prices.maxPrice']}</p>
        )}
      </div>
    </div>
  );
}
