'use client';

import { useState } from 'react';
import { useUsers } from '@/lib/queries/users';
import { type GetUsersRequest } from '@/lib/types/user';
import { UserHeader } from './UserHeader';
import { UserSearchFilters } from './UserSearchFilters';
import { UserTable } from './UserTable';
import { UserStatsCards } from './UserStatsCards';
import { LoadingSpinner } from '@/shared/ui';

export function UserManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetUsersRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const request: GetUsersRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useUsers(request);

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
    key: keyof Omit<GetUsersRequest, 'page' | 'limit'>,
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
      <UserHeader />

      {/* 통계 카드 */}
      <UserStatsCards />

      <UserSearchFilters
        searchTerm={searchTerm}
        filters={filters}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {isInitialLoading ? (
        <LoadingSpinner text='사용자 목록을 불러오는 중...' />
      ) : (
        <UserTable
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
