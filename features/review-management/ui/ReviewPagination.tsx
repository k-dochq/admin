'use client';

import { Button } from '@/components/ui/button';

export interface ReviewPaginationProps {
  page: number;
  limit: number;
  currentCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function ReviewPagination({
  page,
  limit,
  currentCount,
  hasNextPage,
  hasPrevPage,
  isFetching,
  onPageChange,
}: ReviewPaginationProps) {
  if (!hasPrevPage && !hasNextPage) return null;

  const start = (page - 1) * limit + 1;
  const end = (page - 1) * limit + currentCount;

  return (
    <div className='flex items-center justify-between pt-4'>
      <div className='text-sm text-gray-500'>
        {currentCount > 0 ? `${start}-${end}개 표시` : `페이지 ${page}`}
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isFetching}
        >
          이전
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isFetching}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
