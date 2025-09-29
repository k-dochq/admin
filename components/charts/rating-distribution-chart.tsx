'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyReviewStats } from '@/lib/queries/dashboard';

interface RatingDistributionChartProps {
  data: MonthlyReviewStats[];
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  // 평점 분포 데이터 생성 (1점~5점)
  const ratingDistribution = [
    { rating: '1점', count: 0, percentage: 0 },
    { rating: '2점', count: 0, percentage: 0 },
    { rating: '3점', count: 0, percentage: 0 },
    { rating: '4점', count: 0, percentage: 0 },
    { rating: '5점', count: 0, percentage: 0 },
  ];

  // 실제 데이터에서 평점 분포 계산 (임시로 랜덤 데이터 생성)
  const totalReviews = data.reduce((sum, item) => sum + item.count, 0);
  const avgRating =
    data.reduce((sum, item) => sum + item.averageRating * item.count, 0) / totalReviews;

  // 평점 분포 시뮬레이션 (실제로는 데이터베이스에서 가져와야 함)
  ratingDistribution.forEach((item, index) => {
    const rating = index + 1;
    const weight = Math.exp(-Math.pow(rating - avgRating, 2) / 2); // 정규분포 기반 가중치
    item.count = Math.round(totalReviews * weight * 0.2); // 전체의 20% 정도로 조정
    item.percentage = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
  });

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart data={ratingDistribution}>
        <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
        <XAxis dataKey='rating' tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string, props: { payload?: { percentage: number } }) => [
            `${value}개 (${props.payload?.percentage.toFixed(1) || 0}%)`,
            '리뷰 수',
          ]}
        />
        <Bar dataKey='count' fill='#10b981' name='리뷰 수' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
