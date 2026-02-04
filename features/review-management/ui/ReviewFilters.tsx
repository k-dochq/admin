'use client';

import { useState, useEffect } from 'react';
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
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHospitals } from '@/lib/queries/hospitals';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { HospitalCombobox } from '@/shared/ui';
import { getLocalizedText } from '../lib/utils/review-utils';
import { REVIEW_USER_TYPE_FILTER_OPTIONS } from '../lib/user-type';

interface ReviewFiltersProps {
  onUpdateURL: (updates: Record<string, string | null>) => void;
  onResetFilters: () => void;
  hospitalId: string;
  onHospitalBulkAction: (isActive: boolean) => void;
}

export function ReviewFilters({
  onUpdateURL,
  onResetFilters,
  hospitalId,
  onHospitalBulkAction,
}: ReviewFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search') || '';
  const medicalSpecialtyId = searchParams.get('medicalSpecialtyId') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const isRecommended = searchParams.get('isRecommended') || 'all';
  const userType = searchParams.get('userType') || 'all';

  const [searchInput, setSearchInput] = useState(search);

  const { data: hospitalsData } = useHospitals({ limit: 200 });
  const { data: medicalSpecialties } = useMedicalSpecialties();

  // 검색 입력값을 URL의 search와 동기화
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // 검색 실행
  const handleSearch = () => {
    onUpdateURL({ search: searchInput || null, page: '1' });
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>필터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7'>
          <div className='flex gap-2'>
            <Input
              placeholder='검색 (사용자명, 병원명)'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className='flex-1'
            />
            <Button onClick={handleSearch} variant='default'>
              검색
            </Button>
          </div>
          <div className='flex gap-2'>
            <HospitalCombobox
              value={hospitalId}
              onValueChange={(value) => {
                onUpdateURL({ hospitalId: value === 'all' ? null : value, page: '1' });
              }}
              hospitals={hospitalsData?.hospitals || []}
              includeAllOption
              allValue='all'
              allLabel='전체 병원'
              placeholder='병원 선택'
            />
            {hospitalId !== 'all' && (
              <div className='flex gap-1'>
                <Button size='sm' variant='outline' onClick={() => onHospitalBulkAction(true)}>
                  <Eye className='mr-1 h-3 w-3' />
                  활성화
                </Button>
                <Button size='sm' variant='outline' onClick={() => onHospitalBulkAction(false)}>
                  <EyeOff className='mr-1 h-3 w-3' />
                  숨김
                </Button>
              </div>
            )}
          </div>
          <div>
            <Select
              value={medicalSpecialtyId}
              onValueChange={(value) => {
                onUpdateURL({ medicalSpecialtyId: value === 'all' ? null : value, page: '1' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='시술부위 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체 시술부위</SelectItem>
                {medicalSpecialties?.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {getLocalizedText(specialty.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={rating}
              onValueChange={(value) => {
                onUpdateURL({ rating: value === 'all' ? null : value, page: '1' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='평점' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체 평점</SelectItem>
                <SelectItem value='5'>5점</SelectItem>
                <SelectItem value='4'>4점</SelectItem>
                <SelectItem value='3'>3점</SelectItem>
                <SelectItem value='2'>2점</SelectItem>
                <SelectItem value='1'>1점</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={isRecommended}
              onValueChange={(value) => {
                onUpdateURL({ isRecommended: value === 'all' ? null : value, page: '1' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='추천 여부' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                <SelectItem value='true'>추천</SelectItem>
                <SelectItem value='false'>비추천</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={userType}
              onValueChange={(value) => {
                onUpdateURL({ userType: value === 'all' ? null : value, page: '1' });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='사용자 타입' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {REVIEW_USER_TYPE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={onResetFilters} variant='outline' className='w-full'>
              필터 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
