'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { Search, Filter, X } from 'lucide-react';
import {
  GetUsersRequest,
  UserStatusType,
  UserRoleType,
  UserGenderType,
  UserLocale,
  USER_STATUS_TYPE_LABELS,
  USER_ROLE_TYPE_LABELS,
  USER_GENDER_TYPE_LABELS,
  USER_LOCALE_LABELS,
} from '@/lib/types/user';

interface UserSearchFiltersProps {
  searchTerm: string;
  filters: Omit<GetUsersRequest, 'page' | 'limit'>;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (
    key: keyof Omit<GetUsersRequest, 'page' | 'limit'>,
    value: string | boolean | undefined,
  ) => void;
}

export function UserSearchFilters({
  searchTerm,
  filters,
  onSearchTermChange,
  onSearch,
  onFilterChange,
}: UserSearchFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleClearFilters = () => {
    onFilterChange('userStatusType', undefined);
    onFilterChange('drRoleType', undefined);
    onFilterChange('genderType', undefined);
    onFilterChange('locale', undefined);
    onFilterChange('sortBy', undefined);
    onFilterChange('sortOrder', undefined);
  };

  const hasActiveFilters =
    filters.userStatusType ||
    filters.drRoleType ||
    filters.genderType ||
    filters.locale ||
    filters.sortBy ||
    filters.sortOrder;

  return (
    <div className='space-y-4'>
      {/* 기본 검색 */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            placeholder='이름, 이메일, 전화번호로 검색...'
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && onSearch()}
            className='pl-10'
          />
        </div>
        <Button onClick={onSearch} variant='default'>
          검색
        </Button>
        <Button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          variant='outline'
          className='flex items-center space-x-2'
        >
          <Filter className='h-4 w-4' />
          <span>고급 필터</span>
        </Button>
      </div>

      {/* 고급 필터 */}
      {showAdvancedFilters && (
        <div className='space-y-4 rounded-lg bg-gray-50 p-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium text-gray-900'>고급 필터</h3>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant='ghost'
                size='sm'
                className='text-gray-500 hover:text-gray-700'
              >
                <X className='mr-1 h-4 w-4' />
                필터 초기화
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* 사용자 상태 */}
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>사용자 상태</label>
              <Select
                value={filters.userStatusType || undefined}
                onValueChange={(value: string) =>
                  onFilterChange('userStatusType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='전체' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  {Object.entries(USER_STATUS_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 사용자 역할 */}
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>사용자 역할</label>
              <Select
                value={filters.drRoleType || undefined}
                onValueChange={(value: string) =>
                  onFilterChange('drRoleType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='전체' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  {Object.entries(USER_ROLE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 성별 */}
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>성별</label>
              <Select
                value={filters.genderType || undefined}
                onValueChange={(value: string) =>
                  onFilterChange('genderType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='전체' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  {Object.entries(USER_GENDER_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 로케일 */}
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>언어</label>
              <Select
                value={filters.locale || undefined}
                onValueChange={(value: string) =>
                  onFilterChange('locale', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='전체' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  {Object.entries(USER_LOCALE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 정렬 옵션 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>정렬 기준</label>
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value: string) => onFilterChange('sortBy', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='createdAt'>가입일</SelectItem>
                  <SelectItem value='updatedAt'>수정일</SelectItem>
                  <SelectItem value='last_sign_in_at'>최근 로그인</SelectItem>
                  <SelectItem value='name'>이름</SelectItem>
                  <SelectItem value='email'>이메일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>정렬 순서</label>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value: string) => onFilterChange('sortOrder', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>내림차순</SelectItem>
                  <SelectItem value='asc'>오름차순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
