'use client';

import { useState } from 'react';
import { useBanners } from '@/lib/queries/banners';
import { type GetBannersRequest } from '@/features/banner-management/api';
import { BannerHeader } from './BannerHeader';
import { BannerTable } from './BannerTable';
import { LoadingSpinner } from '@/shared/ui';

export function BannerManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetBannersRequest, 'page' | 'limit'>>({});

  const request: GetBannersRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useBanners(request);

  // 첫 로딩 여부 확인 (데이터가 없고 로딩 중일 때)
  const isInitialLoading = isLoading && !data;

  const handleFilterChange = (key: string, value: boolean | undefined) => {
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
      <BannerHeader />

      <BannerTable
        data={data}
        isLoading={isInitialLoading}
        isFetching={isFetching}
        page={page}
        onPageChange={setPage}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
