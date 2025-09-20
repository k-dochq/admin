'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { useUserStats } from '@/lib/queries/users';
import { Users, UserCheck, UserX, UserMinus, TrendingUp, Calendar } from 'lucide-react';

export function UserStatsCards() {
  const { data: stats, isLoading, error } = useUserStats();

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
              <div className='h-4 w-16 animate-pulse rounded bg-gray-200'></div>
            </CardHeader>
            <CardContent>
              <div className='mb-2 h-8 w-16 animate-pulse rounded bg-gray-200'></div>
              <div className='h-3 w-24 animate-pulse rounded bg-gray-200'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-8 text-center'>
        <p className='text-red-600'>통계를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      title: '전체 사용자',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: '등록된 모든 사용자',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '활성 사용자',
      value: stats.activeUsers.toLocaleString(),
      icon: UserCheck,
      description: '현재 활성 상태',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '비활성 사용자',
      value: stats.inactiveUsers.toLocaleString(),
      icon: UserMinus,
      description: '비활성 상태',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '정지된 사용자',
      value: stats.suspendedUsers.toLocaleString(),
      icon: UserX,
      description: '정지된 사용자',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>{stat.title}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-gray-900'>{stat.value}</div>
              <p className='mt-1 text-xs text-gray-500'>{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 추가 통계 */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>이번 달 신규 가입</CardTitle>
            <div className='rounded-full bg-purple-100 p-2'>
              <TrendingUp className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.newUsersThisMonth.toLocaleString()}
            </div>
            <p className='mt-1 text-xs text-gray-500'>이번 달에 가입한 사용자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>이번 주 신규 가입</CardTitle>
            <div className='rounded-full bg-indigo-100 p-2'>
              <Calendar className='h-4 w-4 text-indigo-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.newUsersThisWeek.toLocaleString()}
            </div>
            <p className='mt-1 text-xs text-gray-500'>이번 주에 가입한 사용자 수</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
