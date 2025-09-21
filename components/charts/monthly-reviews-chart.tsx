'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyReviewStats } from '@/lib/queries/dashboard';

interface MonthlyReviewsChartProps {
  data: MonthlyReviewStats[];
}

export function MonthlyReviewsChart({ data }: MonthlyReviewsChartProps) {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
        <XAxis
          dataKey='month'
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value + '-01');
            return date.toLocaleDateString('ko-KR', { month: 'short' });
          }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          labelFormatter={(value) => {
            const date = new Date(value + '-01');
            return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
          }}
          formatter={(value: number, name: string) => {
            if (name === 'count') return [`${value}개`, '리뷰 수'];
            if (name === 'averageRating') return [`${value.toFixed(1)}점`, '평균 평점'];
            return [value, name];
          }}
        />
        <Bar dataKey='count' fill='#3b82f6' name='리뷰 수' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
