'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserWithDetails,
  UserStatusType,
  UserRoleType,
  UserGenderType,
  UserLocale,
  USER_STATUS_TYPE_LABELS,
  USER_ROLE_TYPE_LABELS,
  USER_GENDER_TYPE_LABELS,
  USER_LOCALE_LABELS,
} from '@/lib/types/user';

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
  user?: UserWithDetails | null;
}

export function UserEditDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  mode,
  user,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
    displayName: '',
    name: '',
    nickName: '',
    email: '',
    phoneNumber: '',
    drRoleType: 'USER',
    genderType: 'MALE',
    locale: 'ko_KR',
    age: undefined,
    userStatusType: 'ACTIVE',
    advertPush: false,
    communityAlarm: false,
    postAlarm: false,
    collectPersonalInfo: false,
    profileImgUrl: '',
  });

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        displayName: user.displayName || '',
        name: user.name || '',
        nickName: user.nickName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        drRoleType: user.drRoleType || 'USER',
        genderType: user.genderType || 'MALE',
        locale: user.locale || 'ko_KR',
        age: user.age || undefined,
        userStatusType: user.userStatusType || 'ACTIVE',
        advertPush: user.advertPush || false,
        communityAlarm: user.communityAlarm || false,
        postAlarm: user.postAlarm || false,
        collectPersonalInfo: user.collectPersonalInfo || false,
        profileImgUrl: user.profileImgUrl || '',
      });
    } else {
      setFormData({
        displayName: '',
        name: '',
        nickName: '',
        email: '',
        phoneNumber: '',
        drRoleType: 'USER',
        genderType: 'MALE',
        locale: 'ko_KR',
        age: undefined,
        userStatusType: 'ACTIVE',
        advertPush: false,
        communityAlarm: false,
        postAlarm: false,
        collectPersonalInfo: false,
        profileImgUrl: '',
      });
    }
  }, [mode, user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '사용자 추가' : '사용자 수정'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* 기본 정보 */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900'>기본 정보</h3>

              <div>
                <Label htmlFor='displayName'>표시 이름</Label>
                <Input
                  id='displayName'
                  value={formData.displayName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('displayName', e.target.value)
                  }
                  placeholder='표시할 이름을 입력하세요'
                />
              </div>

              <div>
                <Label htmlFor='name'>실명</Label>
                <Input
                  id='name'
                  value={formData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('name', e.target.value)
                  }
                  placeholder='실명을 입력하세요'
                />
              </div>

              <div>
                <Label htmlFor='nickName'>닉네임</Label>
                <Input
                  id='nickName'
                  value={formData.nickName || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('nickName', e.target.value)
                  }
                  placeholder='닉네임을 입력하세요'
                />
              </div>

              <div>
                <Label htmlFor='email'>이메일</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('email', e.target.value)
                  }
                  placeholder='이메일을 입력하세요'
                />
              </div>

              <div>
                <Label htmlFor='phoneNumber'>전화번호</Label>
                <Input
                  id='phoneNumber'
                  value={formData.phoneNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  placeholder='전화번호를 입력하세요'
                />
              </div>

              <div>
                <Label htmlFor='age'>나이</Label>
                <Input
                  id='age'
                  type='number'
                  value={formData.age || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder='나이를 입력하세요'
                />
              </div>
            </div>

            {/* 역할 및 설정 */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900'>역할 및 설정</h3>

              <div>
                <Label htmlFor='userStatusType'>사용자 상태</Label>
                <Select
                  value={formData.userStatusType || 'ACTIVE'}
                  onValueChange={(value: string) =>
                    handleInputChange('userStatusType', value as UserStatusType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_STATUS_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='drRoleType'>사용자 역할</Label>
                <Select
                  value={formData.drRoleType || 'USER'}
                  onValueChange={(value: string) =>
                    handleInputChange('drRoleType', value as UserRoleType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='genderType'>성별</Label>
                <Select
                  value={formData.genderType || 'MALE'}
                  onValueChange={(value: string) =>
                    handleInputChange('genderType', value as UserGenderType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_GENDER_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='locale'>언어</Label>
                <Select
                  value={formData.locale || 'ko_KR'}
                  onValueChange={(value: string) =>
                    handleInputChange('locale', value as UserLocale)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_LOCALE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='profileImgUrl'>프로필 이미지 URL</Label>
                <Input
                  id='profileImgUrl'
                  value={formData.profileImgUrl || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('profileImgUrl', e.target.value)
                  }
                  placeholder='프로필 이미지 URL을 입력하세요'
                />
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>알림 설정</h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='advertPush'>광고 푸시 알림</Label>
                <Switch
                  id='advertPush'
                  checked={formData.advertPush || false}
                  onCheckedChange={(checked: boolean) => handleInputChange('advertPush', checked)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='communityAlarm'>커뮤니티 알림</Label>
                <Switch
                  id='communityAlarm'
                  checked={formData.communityAlarm || false}
                  onCheckedChange={(checked: boolean) =>
                    handleInputChange('communityAlarm', checked)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='postAlarm'>게시글 알림</Label>
                <Switch
                  id='postAlarm'
                  checked={formData.postAlarm || false}
                  onCheckedChange={(checked: boolean) => handleInputChange('postAlarm', checked)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <Label htmlFor='collectPersonalInfo'>개인정보 수집 동의</Label>
                <Switch
                  id='collectPersonalInfo'
                  checked={formData.collectPersonalInfo || false}
                  onCheckedChange={(checked: boolean) =>
                    handleInputChange('collectPersonalInfo', checked)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              취소
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? '처리 중...' : mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
