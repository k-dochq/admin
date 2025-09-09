'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function HospitalManagementSkeleton() {
  return (
    <div className='space-y-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center justify-end'>
        <Skeleton className='h-10 w-24' />
      </div>

      {/* 검색 및 필터 영역 */}
      <div className='bg-card rounded-lg border p-6'>
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          {/* 검색 */}
          <div className='flex-1'>
            <div className='flex space-x-2'>
              <Skeleton className='h-10 flex-1' />
              <Skeleton className='h-10 w-10' />
            </div>
          </div>

          {/* 필터들 */}
          <div className='flex flex-wrap gap-4'>
            <Skeleton className='h-10 w-[180px]' />
            <Skeleton className='h-10 w-[150px]' />
            <Skeleton className='h-10 w-[150px]' />
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className='bg-card rounded-lg border'>
        {/* 테이블 헤더 */}
        <div className='p-6'>
          <div className='flex items-center space-x-2'>
            <Skeleton className='h-5 w-5' />
            <Skeleton className='h-6 w-24' />
          </div>
        </div>

        <div className='rounded-md border'>
          {/* 테이블 헤더 */}
          <div className='p-4'>
            <div className='grid grid-cols-8 gap-4'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>

          {/* 테이블 행들 */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className='border-t p-4'>
              <div className='grid grid-cols-8 items-center gap-4'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
                <div className='flex items-center space-x-1'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-8' />
                </div>
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-6 w-16 rounded-full' />
                <div className='flex justify-end space-x-2'>
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                  <Skeleton className='h-8 w-8' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이지네이션 영역 */}
      <div className='flex items-center justify-between pt-4'>
        <Skeleton className='h-4 w-32' />
        <div className='flex space-x-2'>
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-8 w-16' />
        </div>
      </div>
    </div>
  );
}
