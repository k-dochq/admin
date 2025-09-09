'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type PriceInfo, type FormErrors, type DistrictForForm } from '../api/entities/types';

interface AdditionalInfoSectionProps {
  ranking: number | undefined;
  discountRate: number | undefined;
  districtId: string | undefined;
  prices: PriceInfo | undefined;
  districts: DistrictForForm[];
  isLoadingDistricts: boolean;
  errors: FormErrors;
  onUpdateRanking: (value: number | undefined) => void;
  onUpdateDiscountRate: (value: number | undefined) => void;
  onUpdateDistrictId: (value: string | undefined) => void;
  onUpdatePrices: (prices: PriceInfo | undefined) => void;
}

export function AdditionalInfoSection({
  ranking,
  discountRate,
  districtId,
  prices,
  districts,
  isLoadingDistricts,
  errors,
  onUpdateRanking,
  onUpdateDiscountRate,
  onUpdateDistrictId,
  onUpdatePrices,
}: AdditionalInfoSectionProps) {
  const handlePriceChange = (field: keyof PriceInfo, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const currentPrices = prices || {};

    onUpdatePrices({
      ...currentPrices,
      [field]: numValue,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기타 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 랭킹 및 할인율 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='ranking'>랭킹</Label>
            <Input
              id='ranking'
              type='number'
              min='1'
              max='100'
              placeholder='1-100 사이의 숫자 입력'
              value={ranking?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value;
                onUpdateRanking(value === '' ? undefined : Number(value));
              }}
            />
            {errors.ranking && <p className='text-destructive mt-1 text-sm'>{errors.ranking}</p>}
            <p className='text-muted-foreground mt-1 text-sm'>
              숫자가 낮을수록 높은 순위입니다. (1이 최고 순위)
            </p>
          </div>
          <div>
            <Label htmlFor='discountRate'>할인율 (%)</Label>
            <Input
              id='discountRate'
              type='number'
              step='0.1'
              min='0'
              max='100'
              placeholder='할인율 입력'
              value={discountRate?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value;
                onUpdateDiscountRate(value === '' ? undefined : Number(value));
              }}
            />
            {errors.discountRate && (
              <p className='text-destructive mt-1 text-sm'>{errors.discountRate}</p>
            )}
          </div>
        </div>

        {/* 가격 정보 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='minPrice'>최소 가격 (원)</Label>
            <Input
              id='minPrice'
              type='number'
              min='0'
              placeholder='최소 가격 입력'
              value={prices?.minPrice?.toString() || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            />
            {errors['prices.minPrice'] && (
              <p className='text-destructive mt-1 text-sm'>{errors['prices.minPrice']}</p>
            )}
          </div>
          <div>
            <Label htmlFor='maxPrice'>최대 가격 (원)</Label>
            <Input
              id='maxPrice'
              type='number'
              min='0'
              placeholder='최대 가격 입력'
              value={prices?.maxPrice?.toString() || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            />
            {errors['prices.maxPrice'] && (
              <p className='text-destructive mt-1 text-sm'>{errors['prices.maxPrice']}</p>
            )}
          </div>
        </div>

        {/* 지역 선택 */}
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
      </CardContent>
    </Card>
  );
}
