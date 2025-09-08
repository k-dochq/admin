'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function InvitationCodesListSkeleton() {
  return (
    <div className='space-y-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-6 w-32' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-16' />
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className='rounded-md border'>
        {/* 테이블 헤더 */}
        <div className='border-b p-4'>
          <div className='grid grid-cols-6 gap-4'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
          </div>
        </div>

        {/* 테이블 행들 */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='border-b p-4 last:border-b-0'>
            <div className='grid grid-cols-6 items-center gap-4'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-6 w-20 rounded-full' />
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-24' />
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
