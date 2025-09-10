'use client';

import { useState } from 'react';
import { useDoctors } from '@/lib/queries/doctors';
import { type GetDoctorsRequest } from '@/features/doctor-management/api/entities/types';
import { createDoctorsRequest } from '@/features/doctor-management/api/entities/constants';
import { DoctorHeader } from './DoctorHeader';
import { DoctorSearchFilters } from './DoctorSearchFilters';
import { DoctorTable } from './DoctorTable';
import { LoadingSpinner } from '@/shared/ui';

export function DoctorManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetDoctorsRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const request: GetDoctorsRequest = createDoctorsRequest({
    page,
    ...filters,
  });

  const { data, isLoading, error, isFetching } = useDoctors(request);

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
    key: keyof Omit<GetDoctorsRequest, 'page' | 'limit'>,
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
      <DoctorHeader />

      <DoctorSearchFilters
        searchTerm={searchTerm}
        filters={filters}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {isInitialLoading ? (
        <LoadingSpinner text='의사 목록을 불러오는 중...' />
      ) : (
        <DoctorTable
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
