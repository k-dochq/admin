'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, User } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useUsers } from '@/lib/queries/users';
import {
  USER_ROLE_TYPE_LABELS,
  USER_GENDER_TYPE_LABELS,
  USER_LOCALE_LABELS,
} from '@/lib/types/user';
import type { UserRoleType, UserGenderType, UserLocale, UserStatusType } from '@prisma/client';
import type { ReviewAddFormErrors } from '../model/useReviewAddForm';

interface UserSelectionSectionProps {
  userId: string;
  userData: {
    name?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    drRoleType?: UserRoleType;
    genderType?: UserGenderType;
    locale?: UserLocale;
    age?: number;
    userStatusType?: UserStatusType;
    advertPush?: boolean;
    communityAlarm?: boolean;
    postAlarm?: boolean;
    collectPersonalInfo?: boolean;
    profileImgUrl?: string;
  } | null;
  errors: ReviewAddFormErrors;
  onUpdateUserId: (value: string) => void;
  onUpdateUserData: (
    value: {
      name?: string;
      displayName?: string;
      email?: string;
      phoneNumber?: string;
      drRoleType?: UserRoleType;
      genderType?: UserGenderType;
      locale?: UserLocale;
      age?: number;
      userStatusType?: UserStatusType;
      advertPush?: boolean;
      communityAlarm?: boolean;
      postAlarm?: boolean;
      collectPersonalInfo?: boolean;
      profileImgUrl?: string;
    } | null,
  ) => void;
}

export function UserSelectionSection({
  userId,
  userData,
  errors,
  onUpdateUserId,
  onUpdateUserData,
}: UserSelectionSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSelectionMode, setUserSelectionMode] = useState<'existing' | 'new'>('existing');

  // 기존 사용자 검색 (엔터키로만 검색)
  const { data: usersData, isLoading } = useUsers({
    page: 1,
    limit: 20,
    search: searchQuery || undefined,
  });

  const handleUserSelectionModeChange = (mode: 'existing' | 'new') => {
    setUserSelectionMode(mode);
    if (mode === 'existing') {
      onUpdateUserData(null);
    } else {
      onUpdateUserId('');
    }
  };

  const handleUserDataChange = <K extends keyof NonNullable<UserSelectionSectionProps['userData']>>(
    field: K,
    value: NonNullable<UserSelectionSectionProps['userData']>[K],
  ) => {
    onUpdateUserData({
      ...userData,
      [field]: value,
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchTerm);
    }
  };

  const filteredUsers = usersData?.users || [];
  const selectedUser = filteredUsers.find((user) => user.id === userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          사용자 선택
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 사용자 선택 모드 */}
        <div className='space-y-4'>
          <Label className='text-base font-medium'>사용자 선택 방식</Label>
          <RadioGroup
            value={userSelectionMode}
            onValueChange={handleUserSelectionModeChange}
            className='flex gap-6'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='existing' id='existing' />
              <Label htmlFor='existing' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                기존 사용자 선택
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='new' id='new' />
              <Label htmlFor='new' className='flex items-center gap-2'>
                <UserPlus className='h-4 w-4' />새 사용자 생성
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 기존 사용자 선택 */}
        {userSelectionMode === 'existing' && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='user-search'>사용자 검색</Label>
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <Input
                  id='user-search'
                  placeholder='이름, 이메일로 검색... (엔터키로 검색)'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className='pl-10'
                />
              </div>
            </div>

            {errors.userId && <p className='text-destructive text-sm'>{errors.userId}</p>}

            {/* 선택된 사용자 표시 */}
            {selectedUser && (
              <div className='rounded-md border border-green-200 bg-green-50 p-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-green-800'>
                      {selectedUser.name || selectedUser.displayName || '이름 없음'}
                    </div>
                    <div className='text-sm text-green-600'>
                      {selectedUser.email || '이메일 없음'}
                    </div>
                    <div className='text-sm text-green-600'>
                      {selectedUser.phoneNumber || '전화번호 없음'}
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onUpdateUserId('')}
                    className='border-green-300 text-green-700 hover:bg-green-100'
                  >
                    선택 해제
                  </Button>
                </div>
              </div>
            )}

            <div className='max-h-60 overflow-y-auto rounded-md border'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <LoadingSpinner text='사용자 검색 중...' />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  {searchTerm ? '검색 결과가 없습니다.' : '검색어를 입력해주세요.'}
                </div>
              ) : (
                <div className='divide-y'>
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`cursor-pointer p-4 hover:bg-gray-50 ${
                        userId === user.id ? 'border-blue-200 bg-blue-50' : ''
                      }`}
                      onClick={() => onUpdateUserId(user.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onUpdateUserId(user.id);
                        }
                      }}
                      role='button'
                      tabIndex={0}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='font-medium'>
                            {user.name || user.displayName || '이름 없음'}
                          </div>
                          <div className='text-sm text-gray-500'>{user.email || '이메일 없음'}</div>
                          <div className='text-sm text-gray-500'>
                            {user.phoneNumber || '전화번호 없음'}
                          </div>
                        </div>
                        <div className='flex flex-col gap-1'>
                          {user.drRoleType && (
                            <Badge variant='secondary' className='text-xs'>
                              {USER_ROLE_TYPE_LABELS[user.drRoleType]}
                            </Badge>
                          )}
                          {user.genderType && (
                            <Badge variant='outline' className='text-xs'>
                              {USER_GENDER_TYPE_LABELS[user.genderType]}
                            </Badge>
                          )}
                          <Badge variant='outline' className='text-xs'>
                            {USER_LOCALE_LABELS[user.locale || 'ko_KR']}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 새 사용자 생성 */}
        {userSelectionMode === 'new' && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='user-name'>이름 *</Label>
                <Input
                  id='user-name'
                  placeholder='사용자 이름'
                  value={userData?.name || ''}
                  onChange={(e) => handleUserDataChange('name', e.target.value)}
                />
                {errors.userData?.name && (
                  <p className='text-destructive text-sm'>{errors.userData.name}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-display-name'>표시 이름</Label>
                <Input
                  id='user-display-name'
                  placeholder='표시할 이름'
                  value={userData?.displayName || ''}
                  onChange={(e) => handleUserDataChange('displayName', e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-email'>이메일 *</Label>
                <Input
                  id='user-email'
                  type='email'
                  placeholder='user@example.com'
                  value={userData?.email || ''}
                  onChange={(e) => handleUserDataChange('email', e.target.value)}
                />
                {errors.userData?.email && (
                  <p className='text-destructive text-sm'>{errors.userData.email}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-phone'>전화번호</Label>
                <Input
                  id='user-phone'
                  placeholder='010-1234-5678'
                  value={userData?.phoneNumber || ''}
                  onChange={(e) => handleUserDataChange('phoneNumber', e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-role'>사용자 역할</Label>
                <Select
                  value={userData?.drRoleType || ''}
                  onValueChange={(value: UserRoleType) => handleUserDataChange('drRoleType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='역할 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-gender'>성별</Label>
                <Select
                  value={userData?.genderType || ''}
                  onValueChange={(value: UserGenderType) =>
                    handleUserDataChange('genderType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='성별 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_GENDER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-locale'>언어</Label>
                <Select
                  value={userData?.locale || 'ko_KR'}
                  onValueChange={(value: UserLocale) => handleUserDataChange('locale', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='언어 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_LOCALE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='user-age'>나이</Label>
                <Input
                  id='user-age'
                  type='number'
                  placeholder='25'
                  value={userData?.age || ''}
                  onChange={(e) =>
                    handleUserDataChange(
                      'age',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
