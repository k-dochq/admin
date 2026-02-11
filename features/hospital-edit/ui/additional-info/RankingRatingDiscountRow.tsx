'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type FormErrors } from '../../api/entities/types';

interface RankingRatingDiscountRowProps {
  ranking: number | undefined;
  rating: number | undefined;
  discountRate: number | undefined;
  recommendedRanking?: number;
  errors: FormErrors;
  onUpdateRanking: (value: number | undefined) => void;
  onUpdateRating: (value: number | undefined) => void;
  onUpdateDiscountRate: (value: number | undefined) => void;
  onUpdateRecommendedRanking?: (value: number | undefined) => void;
}

export function RankingRatingDiscountRow({
  ranking,
  rating,
  discountRate,
  recommendedRanking,
  errors,
  onUpdateRanking,
  onUpdateRating,
  onUpdateDiscountRate,
  onUpdateRecommendedRanking,
}: RankingRatingDiscountRowProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
      {onUpdateRecommendedRanking && (
        <div>
          <Label htmlFor='recommendedRanking'>추천순위</Label>
          <Input
            id='recommendedRanking'
            type='number'
            min='1'
            placeholder='추천순위 입력'
            value={recommendedRanking?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              onUpdateRecommendedRanking(value === '' ? undefined : Number(value));
            }}
          />
          {errors.recommendedRanking && (
            <p className='text-destructive mt-1 text-sm'>{errors.recommendedRanking}</p>
          )}
          <p className='text-muted-foreground mt-1 text-sm'>추천 병원의 순위입니다.</p>
        </div>
      )}
      <div>
        <Label htmlFor='rating'>평점</Label>
        <Input
          id='rating'
          type='number'
          step='0.1'
          min='0'
          max='5'
          placeholder='0.0-5.0 사이의 평점 입력'
          value={rating?.toString() || ''}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateRating(value === '' ? undefined : Number(value));
          }}
        />
        {errors.rating && <p className='text-destructive mt-1 text-sm'>{errors.rating}</p>}
        <p className='text-muted-foreground mt-1 text-sm'>
          0.0-5.0 사이의 평점입니다. (소수점 1자리)
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
  );
}
