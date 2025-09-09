'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function HospitalTableSkeleton() {
  return (
    <div className='border-border/50 rounded-lg border'>
      {/* 테이블 헤더 */}
      <div className='p-4'>
        <div className='grid grid-cols-7 gap-4'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>

      {/* 테이블 행들 */}
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='border-border/30 border-t p-4'>
          <div className='grid grid-cols-7 items-center gap-4'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
            <div className='flex flex-wrap gap-1'>
              <Skeleton className='h-5 w-12 rounded-full' />
              <Skeleton className='h-5 w-16 rounded-full' />
              <Skeleton className='h-5 w-14 rounded-full' />
            </div>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-4 w-20' />
            <div className='flex justify-end space-x-2'>
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
              <Skeleton className='h-8 w-8' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
