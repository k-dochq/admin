'use client';

import { Button } from '@/shared/ui';

interface UserTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}

export function UserTablePagination({
  page,
  limit,
  total,
  onPageChange,
  isFetching,
}: UserTablePaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-between pt-4'>
      <div className='text-sm text-gray-700'>
        {(page - 1) * limit + 1}-{Math.min(page * limit, total)} / {total}명
      </div>
      <div className='flex space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || isFetching}
        >
          이전
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={page * limit >= total || isFetching}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
