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
import { type GetHospitalsRequest } from '@/features/hospital-management/api';

interface HospitalSearchFiltersProps {
  searchTerm: string;
  filters: Omit<GetHospitalsRequest, 'page' | 'limit'>;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (
    key: keyof Omit<GetHospitalsRequest, 'page' | 'limit'>,
    value: string | boolean | undefined,
  ) => void;
}

export function HospitalSearchFilters({
  searchTerm,
  filters,
  onSearchTermChange,
  onSearch,
  onFilterChange,
}: HospitalSearchFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>검색 및 필터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          {/* 검색 */}
          <div className='flex-1'>
            <div className='flex space-x-2'>
              <Input
                placeholder='병원명, 전화번호, 이메일로 검색...'
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
              <Button onClick={onSearch}>
                <Search className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* 승인 상태 필터 */}
          <Select
            value={filters.approvalStatus || 'all'}
            onValueChange={(value) =>
              onFilterChange(
                'approvalStatus',
                value === 'all' ? undefined : (value as GetHospitalsRequest['approvalStatus']),
              )
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='승인 상태' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              <SelectItem value='APPROVED'>승인됨</SelectItem>
              <SelectItem value='PENDING'>대기중</SelectItem>
              <SelectItem value='REJECTED'>거부됨</SelectItem>
            </SelectContent>
          </Select>

          {/* 일본 서비스 필터 */}
          <Select
            value={filters.enableJp === undefined ? 'all' : filters.enableJp.toString()}
            onValueChange={(value) =>
              onFilterChange('enableJp', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue placeholder='일본 서비스' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              <SelectItem value='true'>활성화</SelectItem>
              <SelectItem value='false'>비활성화</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
