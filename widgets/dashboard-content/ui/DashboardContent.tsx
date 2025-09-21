'use client';

import React from 'react';
import { Users, Building2, Star, MessageSquare, Activity } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { ChartCard } from '@/components/ui/chart-card';
import { ActivityFeed } from '@/components/ui/activity-feed';
import { UserStatusChart } from '@/components/charts/user-status-chart';
import { MonthlyUsersChart } from '@/components/charts/monthly-users-chart';
import { MonthlyReviewsChart } from '@/components/charts/monthly-reviews-chart';
import { RatingDistributionChart } from '@/components/charts/rating-distribution-chart';
import { SpecialtyReviewsChart } from '@/components/charts/specialty-reviews-chart';
import {
  useDashboardStats,
  useUserStatusStats,
  useMonthlyUserStats,
  useMonthlyReviewStats,
  useSpecialtyReviewStats,
  useRecentActivities,
} from '@/lib/hooks/use-dashboard';

// 로딩 스켈레톤 컴포넌트
function StatsCardSkeleton() {
  return (
    <div className='bg-card animate-pulse rounded-lg border p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <div className='h-4 w-24 rounded bg-gray-200'></div>
          <div className='h-8 w-16 rounded bg-gray-200'></div>
        </div>
        <div className='h-8 w-8 rounded-full bg-gray-200'></div>
      </div>
    </div>
  );
}

function ChartCardSkeleton() {
  return (
    <div className='bg-card animate-pulse rounded-lg border p-6 shadow-sm'>
      <div className='mb-4'>
        <div className='mb-2 h-6 w-32 rounded bg-gray-200'></div>
        <div className='h-4 w-48 rounded bg-gray-200'></div>
      </div>
      <div className='h-80 rounded bg-gray-200'></div>
    </div>
  );
}

export function DashboardContent() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();

  const { data: userStatusStats, isLoading: userStatusLoading } = useUserStatusStats();

  const { data: monthlyUserStats, isLoading: monthlyUserLoading } = useMonthlyUserStats();

  const { data: monthlyReviewStats, isLoading: monthlyReviewLoading } = useMonthlyReviewStats();

  const { data: specialtyReviewStats, isLoading: specialtyReviewLoading } =
    useSpecialtyReviewStats();

  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities();

  const isLoading =
    statsLoading ||
    userStatusLoading ||
    monthlyUserLoading ||
    monthlyReviewLoading ||
    specialtyReviewLoading ||
    activitiesLoading;

  if (statsError) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold text-red-600'>오류가 발생했습니다</h2>
          <p className='text-muted-foreground'>
            대시보드 데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='h-8 w-48 animate-pulse rounded bg-gray-200'></div>
            <div className='h-4 w-64 animate-pulse rounded bg-gray-200'></div>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartCardSkeleton key={i} />
          ))}
        </div>
        <div className='bg-card animate-pulse rounded-lg border p-6 shadow-sm'>
          <div className='mb-4 h-6 w-32 rounded bg-gray-200'></div>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-start space-x-3 rounded-lg border p-3'>
                <div className='h-8 w-8 rounded-full bg-gray-200'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-24 rounded bg-gray-200'></div>
                  <div className='h-3 w-32 rounded bg-gray-200'></div>
                  <div className='h-3 w-20 rounded bg-gray-200'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* 페이지 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>대시보드</h1>
          <p className='text-muted-foreground'>시스템 현황과 주요 지표를 한눈에 확인하세요</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Activity className='text-muted-foreground h-5 w-5' />
          <span className='text-muted-foreground text-sm'>실시간 업데이트</span>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='전체 사용자'
          value={stats?.totalUsers.toLocaleString() || '0'}
          description={`활성 사용자 ${stats?.activeUsers.toLocaleString() || '0'}명`}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title='등록된 병원'
          value={stats?.totalHospitals.toLocaleString() || '0'}
          description={`승인된 병원 ${stats?.approvedHospitals.toLocaleString() || '0'}개`}
          icon={Building2}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title='총 리뷰 수'
          value={stats?.totalReviews.toLocaleString() || '0'}
          description={`평균 평점 ${stats?.averageRating.toFixed(1) || '0.0'}점`}
          icon={Star}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title='상담 메시지'
          value={stats?.totalConsultations.toLocaleString() || '0'}
          description={`의사 ${stats?.approvedDoctors.toLocaleString() || '0'}명`}
          icon={MessageSquare}
          trend={{ value: 23.1, isPositive: true }}
        />
      </div>

      {/* 차트 섹션 */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* 사용자 상태 분포 */}
        <ChartCard title='사용자 상태 분포' description='전체 사용자의 상태별 분포를 확인하세요'>
          {userStatusStats ? (
            <UserStatusChart data={userStatusStats} />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-muted-foreground'>데이터를 불러오는 중...</div>
            </div>
          )}
        </ChartCard>

        {/* 월별 가입자 추이 */}
        <ChartCard
          title='월별 가입자 추이'
          description='최근 6개월간의 신규 가입자 수를 확인하세요'
        >
          {monthlyUserStats ? (
            <MonthlyUsersChart data={monthlyUserStats} />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-muted-foreground'>데이터를 불러오는 중...</div>
            </div>
          )}
        </ChartCard>

        {/* 월별 리뷰 현황 */}
        <ChartCard title='월별 리뷰 현황' description='최근 6개월간의 리뷰 수를 확인하세요'>
          {monthlyReviewStats ? (
            <MonthlyReviewsChart data={monthlyReviewStats} />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-muted-foreground'>데이터를 불러오는 중...</div>
            </div>
          )}
        </ChartCard>

        {/* 평점 분포 */}
        <ChartCard title='평점 분포' description='전체 리뷰의 평점별 분포를 확인하세요'>
          {monthlyReviewStats ? (
            <RatingDistributionChart data={monthlyReviewStats} />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-muted-foreground'>데이터를 불러오는 중...</div>
            </div>
          )}
        </ChartCard>

        {/* 전문과별 리뷰 현황 */}
        <ChartCard
          title='전문과별 리뷰 현황'
          description='의료 전문과별 리뷰 수를 파이 차트로 확인하세요'
        >
          {specialtyReviewStats ? (
            <SpecialtyReviewsChart data={specialtyReviewStats} />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <div className='text-muted-foreground'>데이터를 불러오는 중...</div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* 최근 활동 */}
      <div className='bg-card rounded-lg border p-6 shadow-sm'>
        {recentActivities ? (
          <ActivityFeed activities={recentActivities} />
        ) : (
          <div className='flex h-32 items-center justify-center'>
            <div className='text-muted-foreground'>활동 데이터를 불러오는 중...</div>
          </div>
        )}
      </div>
    </div>
  );
}
