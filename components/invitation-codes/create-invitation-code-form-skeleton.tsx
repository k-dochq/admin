'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function CreateInvitationCodeFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* 헤더 영역 */}
      <div className='space-y-2'>
        <Skeleton className='h-6 w-40' />
        <Skeleton className='h-4 w-64' />
      </div>

      {/* 폼 영역 */}
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    </div>
  );
}
