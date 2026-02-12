'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHospitals } from '@/lib/queries/hospitals';
import { type GetHospitalsRequest } from '@/features/hospital-management/api';
import { HospitalHeader } from './HospitalHeader';
import { HospitalSearchFilters } from './HospitalSearchFilters';
import { HospitalTable } from './HospitalTable';
import { LoadingSpinner } from '@/shared/ui';
import { normalizeHospitalSearchTerm } from 'shared/lib';

export function HospitalManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const [filters, setFilters] = useState<Omit<GetHospitalsRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const request: GetHospitalsRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useHospitals(request);

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value != null && value !== '' && !(key === 'page' && value === '1')) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      const query = params.toString();
      router.replace(query ? `/admin/hospitals?${query}` : '/admin/hospitals');
    },
    [searchParams, router],
  );

  const returnToListPath =
    searchParams.toString() ? `/admin/hospitals?${searchParams.toString()}` : '/admin/hospitals';

  // 첫 로딩 여부 확인 (데이터가 없고 로딩 중일 때)
  const isInitialLoading = isLoading && !data;

  const handleSearch = () => {
    const normalized = normalizeHospitalSearchTerm(searchTerm);
    setFilters((prev) => ({
      ...prev,
      search: normalized || undefined,
    }));
    updateURL({ page: '1' });
  };

  const handleFilterChange = (
    key: keyof Omit<GetHospitalsRequest, 'page' | 'limit'>,
    value: string | boolean | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    updateURL({ page: '1' });
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL({ page: newPage === 1 ? null : newPage.toString() });
    },
    [updateURL],
  );

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
      <HospitalHeader />

      <HospitalSearchFilters
        searchTerm={searchTerm}
        filters={filters}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {isInitialLoading ? (
        <LoadingSpinner text='병원 목록을 불러오는 중...' />
      ) : (
        <HospitalTable
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          onPageChange={handlePageChange}
          returnToListPath={returnToListPath}
        />
      )}
    </div>
  );
}
