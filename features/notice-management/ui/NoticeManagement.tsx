'use client';

import { useState } from 'react';
import { useNotices } from '@/lib/queries/notices';
import { type GetNoticesRequest } from '@/features/notice-management/api';
import { NoticeHeader } from './NoticeHeader';
import { NoticeTable } from './NoticeTable';
import { LoadingSpinner } from '@/shared/ui';

export function NoticeManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetNoticesRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const request: GetNoticesRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useNotices(request);

  // 첫 로딩 여부 확인 (데이터가 없고 로딩 중일 때)
  const isInitialLoading = isLoading && !data;

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
    }));
    setPage(1);
  };

  const handleFilterChange = (
    key: keyof Omit<GetNoticesRequest, 'page' | 'limit'>,
    value: string | boolean | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-destructive'>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <NoticeHeader />

      <NoticeTable
        data={data}
        isLoading={isInitialLoading}
        isFetching={isFetching}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
