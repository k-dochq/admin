'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { type GetReservationsRequest } from '@/features/reservation-management/api';
import { useHospitals } from '@/lib/queries/hospitals';
import { ReservationStatus } from '@prisma/client';
import { HospitalCombobox } from '@/shared/ui';

interface ReservationSearchFiltersProps {
  searchTerm: string;
  filters: Omit<GetReservationsRequest, 'page' | 'limit'>;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (
    key: keyof Omit<GetReservationsRequest, 'page' | 'limit'>,
    value: string | undefined,
  ) => void;
}

const RESERVATION_STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'PENDING', label: '대기중' },
  { value: 'PAYMENT_PENDING', label: '결제 대기' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소' },
];

export function ReservationSearchFilters({
  searchTerm,
  filters,
  onSearchTermChange,
  onSearch,
  onFilterChange,
}: ReservationSearchFiltersProps) {
  const { data: hospitalsData } = useHospitals({ limit: 200 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>검색 및 필터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          {/* 검색 (예약 ID만) */}
          <div className='flex-1'>
            <div className='flex space-x-2'>
              <Input
                placeholder='예약 ID 검색...'
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
              <Button onClick={onSearch}>
                <Search className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* 상태 필터 */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFilterChange('status', value === 'all' ? undefined : (value as ReservationStatus))
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='예약 상태' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 상태</SelectItem>
              {RESERVATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 병원 필터 */}
          <div className='w-[200px]'>
            <HospitalCombobox
              value={filters.hospitalId || 'all'}
              onValueChange={(value) => onFilterChange('hospitalId', value === 'all' ? undefined : value)}
              hospitals={hospitalsData?.hospitals || []}
              includeAllOption
              allValue='all'
              allLabel='전체 병원'
              placeholder='병원 선택'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
