'use client';

import { useState } from 'react';
import { useReservations } from '@/lib/queries/reservations';
import {
  type GetReservationsRequest,
  type ReservationForList,
} from '@/features/reservation-management/api';
import { ReservationHeader } from './ReservationHeader';
import { ReservationSearchFilters } from './ReservationSearchFilters';
import { ReservationTable } from './ReservationTable';
import { ReservationDetailDialog } from './ReservationDetailDialog';
import { LoadingSpinner } from '@/shared/ui';

export function ReservationManagement() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<GetReservationsRequest, 'page' | 'limit'>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationForList | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const request: GetReservationsRequest = {
    page,
    limit: 20,
    ...filters,
  };

  const { data, isLoading, error, isFetching } = useReservations(request);

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
    key: keyof Omit<GetReservationsRequest, 'page' | 'limit'>,
    value: string | undefined,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleViewDetail = (reservation: ReservationForList) => {
    setSelectedReservation(reservation);
    setDetailDialogOpen(true);
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
      <ReservationHeader />

      <ReservationSearchFilters
        searchTerm={searchTerm}
        filters={filters}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {isInitialLoading ? (
        <LoadingSpinner text='예약 목록을 불러오는 중...' />
      ) : (
        <ReservationTable
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* 예약 상세 다이얼로그 */}
      {selectedReservation && (
        <ReservationDetailDialog
          reservation={selectedReservation}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  );
}
