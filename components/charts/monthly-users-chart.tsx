'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyUserStats } from '@/lib/queries/dashboard';

interface MonthlyUsersChartProps {
  data: MonthlyUserStats[];
}

export function MonthlyUsersChart({ data }: MonthlyUsersChartProps) {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={data}>
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
          formatter={(value: number) => [`${value}명`, '가입자 수']}
        />
        <Line
          type='monotone'
          dataKey='count'
          stroke='#3b82f6'
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
