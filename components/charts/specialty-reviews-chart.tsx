'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SpecialtyReviewStats } from '@/lib/queries/dashboard';

interface SpecialtyReviewsChartProps {
  data: SpecialtyReviewStats[];
}

const SPECIALTY_LABELS = {
  EYES: '눈',
  NOSE: '코',
  FACIAL_CONTOURING: '페이셜',
  BREAST: '가슴',
  STEM_CELL: '줄기세포',
  LIPOSUCTION: '지방흡입',
  LIFTING: '리프팅',
  HAIR_TRANSPLANT: '모발이식',
  DERMATOLOGY: '피부과',
  LIPS: '입술',
  CHIN: '턱',
  CHEEKS: '볼',
  FOREHEAD: '이마',
  DENTAL: '치과',
};

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

export function SpecialtyReviewsChart({ data }: SpecialtyReviewsChartProps) {
  const chartData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // 상위 8개만 표시
    .map((item, index) => ({
      name: SPECIALTY_LABELS[item.specialty] || item.specialty,
      value: item.count,
      averageRating: item.averageRating,
      color: COLORS[index % COLORS.length],
    }));

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey='value'
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(
            value: number,
            name: string,
            props: { payload?: { name: string; averageRating: number } },
          ) => [
            `${value}개`,
            `${props.payload?.name || 'Unknown'} (평균 ${props.payload?.averageRating.toFixed(1) || 0}점)`,
          ]}
        />
        <Legend
          verticalAlign='bottom'
          height={80}
          formatter={(value, entry) => (
            <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
