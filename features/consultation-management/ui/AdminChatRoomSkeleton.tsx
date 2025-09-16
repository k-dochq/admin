'use client';

import { Card } from '@/components/ui/card';

interface AdminChatRoomSkeletonProps {
  count?: number;
}

export function AdminChatRoomSkeleton({ count = 5 }: AdminChatRoomSkeletonProps) {
  return (
    <div className='space-y-4'>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className='p-4'>
          <div className='flex gap-4'>
            {/* 썸네일 스켈레톤 */}
            <div className='bg-muted h-20 w-20 flex-shrink-0 animate-pulse rounded-lg'></div>

            {/* 텍스트 정보 스켈레톤 */}
            <div className='flex-1 space-y-3'>
              {/* 헤더 (지역, 사용자, 날짜) */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='bg-muted h-5 w-16 animate-pulse rounded'></div>
                  <div className='bg-muted h-5 w-20 animate-pulse rounded'></div>
                </div>
                <div className='bg-muted h-4 w-12 animate-pulse rounded'></div>
              </div>

              {/* 병원명 */}
              <div className='bg-muted h-6 w-40 animate-pulse rounded'></div>

              {/* 마지막 메시지 */}
              <div className='flex items-center justify-between'>
                <div className='flex flex-1 items-center gap-2'>
                  <div className='bg-muted h-5 w-12 animate-pulse rounded'></div>
                  <div className='bg-muted h-4 w-3/4 animate-pulse rounded'></div>
                </div>
                <div className='bg-muted h-5 w-5 animate-pulse rounded-full'></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
