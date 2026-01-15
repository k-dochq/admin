'use client';

import { Button } from '@/components/ui/button';

interface ReviewPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function ReviewPagination({
  page,
  totalPages,
  total,
  limit,
  isFetching,
  onPageChange,
}: ReviewPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-between pt-4'>
      <div className='text-sm text-gray-500'>
        {total}개 중 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}개 표시
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isFetching}
        >
          이전
        </Button>
        <div className='flex items-center gap-1'>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(pageNum)}
                disabled={isFetching}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || isFetching}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
