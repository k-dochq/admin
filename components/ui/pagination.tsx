'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2; // 현재 페이지 앞뒤로 보여줄 페이지 수
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-center gap-1 sm:gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage || isLoading}
        className='flex items-center gap-1 text-xs sm:text-sm'
      >
        <ChevronLeft className='h-3 w-3 sm:h-4 sm:w-4' />
        <span className='hidden sm:inline'>이전</span>
      </Button>

      <div className='hidden items-center gap-1 sm:flex'>
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className='px-2 py-1 text-sm text-gray-500'>
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isCurrentPage ? 'default' : 'outline'}
              size='sm'
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading}
              className='min-w-[40px]'
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* 모바일: 현재 페이지 표시 */}
      <div className='flex items-center gap-1 sm:hidden'>
        <span className='text-xs text-gray-600'>
          {currentPage} / {totalPages}
        </span>
      </div>

      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
        className='flex items-center gap-1 text-xs sm:text-sm'
      >
        <span className='hidden sm:inline'>다음</span>
        <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4' />
      </Button>
    </div>
  );
}
