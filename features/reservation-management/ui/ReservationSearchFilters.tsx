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
import { Prisma } from '@prisma/client';

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

const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (
      (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
    );
  }
  return '';
};

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
  const { data: hospitalsData } = useHospitals({ limit: 100 });

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
          <Select
            value={filters.hospitalId || 'all'}
            onValueChange={(value) =>
              onFilterChange('hospitalId', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='병원 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 병원</SelectItem>
              {hospitalsData?.hospitals
                .sort((a, b) => {
                  const nameA = getLocalizedText(a.name);
                  const nameB = getLocalizedText(b.name);
                  return nameA.localeCompare(nameB, 'ko-KR');
                })
                .map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {getLocalizedText(hospital.name)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
