'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui';
import { Plus, Download, Upload } from 'lucide-react';
import { UserEditDialog } from './UserEditDialog';
import { CreateUserRequest } from '@/lib/types/user';
import { useCreateUser } from '@/lib/queries/users';

export function UserHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createUserMutation = useCreateUser();

  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>사용자 관리</h1>
        <p className='text-sm text-gray-600'>사용자 목록을 조회하고 관리할 수 있습니다.</p>
      </div>

      <div className='flex items-center space-x-3'>
        <Button variant='outline' size='sm'>
          <Download className='mr-2 h-4 w-4' />
          내보내기
        </Button>

        <Button variant='outline' size='sm'>
          <Upload className='mr-2 h-4 w-4' />
          가져오기
        </Button>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          사용자 추가
        </Button>
      </div>

      <UserEditDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
        mode='create'
      />
    </div>
  );
}
