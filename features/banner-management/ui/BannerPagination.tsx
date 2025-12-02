'use client';

import { Button } from '@/components/ui/button';

interface BannerPaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BannerPagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
}: BannerPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='text-muted-foreground text-sm'>
        총 {total}개의 배너 중 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}개 표시
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          이전
        </Button>
        <span className='text-sm'>
          {page} / {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
