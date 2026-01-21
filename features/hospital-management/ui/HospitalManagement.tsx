'use client';

import { useState } from 'react';
import { useHospitals } from '@/lib/queries/hospitals';
import { type GetHospitalsRequest } from '@/features/hospital-management/api';
import { HospitalHeader } from './HospitalHeader';
import { HospitalSearchFilters } from './HospitalSearchFilters';
import { HospitalTable } from './HospitalTable';
import { LoadingSpinner } from '@/shared/ui';
import { normalizeHospitalSearchTerm } from 'shared/lib';

export function HospitalManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetHospitalsRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const request: GetHospitalsRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useHospitals(request);

  // 첫 로딩 여부 확인 (데이터가 없고 로딩 중일 때)
  const isInitialLoading = isLoading && !data;

  const handleSearch = () => {
    const normalized = normalizeHospitalSearchTerm(searchTerm);
    setFilters((prev) => ({
      ...prev,
      search: normalized || undefined,
    }));
    setPage(1);
  };

  const handleFilterChange = (
    key: keyof Omit<GetHospitalsRequest, 'page' | 'limit'>,
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
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
