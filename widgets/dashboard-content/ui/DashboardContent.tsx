'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsCards } from 'features/dashboard/ui/StatsCards';
import { RecentActivity } from 'features/dashboard/ui/RecentActivity';
import { QuickActions } from 'features/dashboard/ui/QuickActions';
import { Plus, Filter, Download } from 'lucide-react';

export function DashboardContent() {
  return (
    <div className='space-y-6'>
      {/* 페이지 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>대시보드</h2>
          <p className='text-muted-foreground'>시스템 현황과 주요 지표를 확인하세요</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <Filter className='mr-2 h-4 w-4' />
            필터
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            내보내기
          </Button>
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            새로 만들기
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <StatsCards />

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>개요</TabsTrigger>
          <TabsTrigger value='analytics'>분석</TabsTrigger>
          <TabsTrigger value='reports'>보고서</TabsTrigger>
          <TabsTrigger value='notifications'>
            알림
            <Badge variant='secondary' className='ml-2'>
              3
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            {/* 메인 차트 영역 */}
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>월별 현황</CardTitle>
                <CardDescription>최근 6개월간의 주요 지표를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <div className='flex h-[300px] items-center justify-center rounded-lg bg-gray-50'>
                  <p className='text-muted-foreground'>차트 영역 (차후 구현)</p>
                </div>
              </CardContent>
            </Card>

            {/* 최근 활동 */}
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>최신 활동 내역을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>분석 대시보드</CardTitle>
              <CardDescription>상세한 분석 데이터를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex h-[400px] items-center justify-center rounded-lg bg-gray-50'>
                <p className='text-muted-foreground'>분석 차트 영역 (차후 구현)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reports' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>보고서</CardTitle>
              <CardDescription>생성된 보고서를 확인하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex h-[400px] items-center justify-center rounded-lg bg-gray-50'>
                <p className='text-muted-foreground'>보고서 목록 (차후 구현)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>알림</CardTitle>
              <CardDescription>중요한 알림과 업데이트를 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center space-x-4 rounded-lg border p-4'>
                  <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>새로운 사용자가 등록되었습니다</p>
                    <p className='text-muted-foreground text-xs'>2분 전</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4 rounded-lg border p-4'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>시스템 업데이트가 완료되었습니다</p>
                    <p className='text-muted-foreground text-xs'>1시간 전</p>
                  </div>
                </div>
                <div className='flex items-center space-x-4 rounded-lg border p-4'>
                  <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>정기 백업이 예정되어 있습니다</p>
                    <p className='text-muted-foreground text-xs'>3시간 전</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
