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
import { useMedicalSpecialties, type MedicalSpecialty } from '@/lib/queries/medical-specialties';

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
  const { data: medicalSpecialties, isLoading: isLoadingSpecialties } = useMedicalSpecialties();

  const getMedicalSpecialtyName = (specialty: MedicalSpecialty): string => {
    if (specialty?.name && typeof specialty.name === 'object' && !Array.isArray(specialty.name)) {
      const localizedName = specialty.name as { ko_KR?: string; en_US?: string; th_TH?: string };
      return localizedName.ko_KR || localizedName.en_US || localizedName.th_TH || '이름 없음';
    }
    return '이름 없음';
  };

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

          {/* 진료부위 필터 */}
          <Select
            value={filters.medicalSpecialtyId || 'all'}
            onValueChange={(value) =>
              onFilterChange('medicalSpecialtyId', value === 'all' ? undefined : value)
            }
            disabled={isLoadingSpecialties}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='진료부위' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 진료부위</SelectItem>
              {medicalSpecialties?.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {getMedicalSpecialtyName(specialty)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
