'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { useHospitals } from '@/lib/queries/hospitals';
import { type GetDoctorsRequest } from '@/features/doctor-management/api/entities/types';
import { parseJsonValueToString } from '@/features/doctor-management/api/entities/types';
import { sortHospitalsByName } from 'shared/lib';

interface DoctorSearchFiltersProps {
  searchTerm: string;
  filters: Omit<GetDoctorsRequest, 'page' | 'limit'>;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (
    key: keyof Omit<GetDoctorsRequest, 'page' | 'limit'>,
    value: string | boolean | undefined,
  ) => void;
}

export function DoctorSearchFilters({
  searchTerm,
  filters,
  onSearchTermChange,
  onSearch,
  onFilterChange,
}: DoctorSearchFiltersProps) {
  // 병원 목록 조회 (페이지네이션 없이 전체 조회)
  const { data: hospitalsData } = useHospitals({
    page: 1,
    limit: 1000, // 충분히 큰 수로 전체 조회
  });

  // 병원 목록을 가나다순으로 정렬
  const hospitals = useMemo(() => {
    if (!hospitalsData?.hospitals) return [];
    return sortHospitalsByName(hospitalsData.hospitals);
  }, [hospitalsData?.hospitals]);

  const handleReset = () => {
    onSearchTermChange('');
    onFilterChange('hospitalId', undefined);
    onFilterChange('genderType', undefined);
    onFilterChange('approvalStatusType', undefined);
    onFilterChange('stop', undefined);
  };

  const hasActiveFilters =
    searchTerm ||
    filters.hospitalId ||
    filters.genderType ||
    filters.approvalStatusType ||
    filters.stop !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>검색 및 필터</span>
          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={handleReset}>
              <X className='mr-2 h-4 w-4' />
              초기화
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 검색어 */}
        <div className='flex gap-2'>
          <div className='flex-1'>
            <Label htmlFor='search'>검색어</Label>
            <Input
              id='search'
              placeholder='의사 이름, 면허번호, 설명, 소속 병원으로 검색...'
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
            />
          </div>
          <div className='flex items-end'>
            <Button onClick={onSearch}>
              <Search className='mr-2 h-4 w-4' />
              검색
            </Button>
          </div>
        </div>

        {/* 필터 옵션들 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* 병원 선택 */}
          <div>
            <Label>병원</Label>
            <Select
              value={filters.hospitalId || 'all'}
              onValueChange={(value) =>
                onFilterChange('hospitalId', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='전체 병원' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체 병원</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {parseJsonValueToString(hospital.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 성별 */}
          <div>
            <Label>성별</Label>
            <Select
              value={filters.genderType || 'all'}
              onValueChange={(value) =>
                onFilterChange(
                  'genderType',
                  value === 'all' ? undefined : (value as 'MALE' | 'FEMALE'),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='전체' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                <SelectItem value='MALE'>남성</SelectItem>
                <SelectItem value='FEMALE'>여성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 승인 상태 */}
          <div>
            <Label>승인 상태</Label>
            <Select
              value={filters.approvalStatusType || 'all'}
              onValueChange={(value) =>
                onFilterChange(
                  'approvalStatusType',
                  value === 'all'
                    ? undefined
                    : (value as 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL'),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='전체' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                <SelectItem value='PENDING'>대기</SelectItem>
                <SelectItem value='APPROVED'>승인</SelectItem>
                <SelectItem value='REJECTED'>거부</SelectItem>
                <SelectItem value='WAITING_APPROVAL'>승인 대기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 활동 상태 */}
          <div>
            <Label>활동 상태</Label>
            <Select
              value={filters.stop === true ? 'stopped' : filters.stop === false ? 'active' : 'all'}
              onValueChange={(value) =>
                onFilterChange(
                  'stop',
                  value === 'stopped' ? true : value === 'active' ? false : undefined,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='전체' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                <SelectItem value='active'>활성</SelectItem>
                <SelectItem value='stopped'>중단</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
