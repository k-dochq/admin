'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import { MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX, UserMinus } from 'lucide-react';
import {
  GetUsersResponse,
  UserWithDetails,
  UpdateUserRequest,
  CreateUserRequest,
  USER_STATUS_TYPE_LABELS,
  USER_STATUS_TYPE_COLORS,
  USER_ROLE_TYPE_LABELS,
  USER_GENDER_TYPE_LABELS,
  USER_LOCALE_LABELS,
} from '@/lib/types/user';
import { useDeleteUser, useBulkUpdateUserStatus, useUpdateUser } from '@/lib/queries/users';
import { UserEditDialog } from './UserEditDialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UserTableProps {
  data?: GetUsersResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function UserTable({ data, isLoading, isFetching, page, onPageChange }: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteUserMutation = useDeleteUser();
  const bulkUpdateStatusMutation = useBulkUpdateUserStatus();
  const updateUserMutation = useUpdateUser();

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(data?.users.map((user) => user.id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleEditUser = (user: UserWithDetails) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await deleteUserMutation.mutateAsync({ id: userId });
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedUsers.length === 0) return;

    const statusLabel = USER_STATUS_TYPE_LABELS[status as keyof typeof USER_STATUS_TYPE_LABELS];
    if (confirm(`선택한 ${selectedUsers.length}명의 사용자를 ${statusLabel}로 변경하시겠습니까?`)) {
      try {
        await bulkUpdateStatusMutation.mutateAsync({
          userIds: selectedUsers,
          userStatusType: status,
        });
        setSelectedUsers([]);
      } catch (error) {
        console.error('Failed to update user status:', error);
      }
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const getStatusBadge = (status: string) => {
    const label = USER_STATUS_TYPE_LABELS[status as keyof typeof USER_STATUS_TYPE_LABELS] || status;
    const colorClass =
      USER_STATUS_TYPE_COLORS[status as keyof typeof USER_STATUS_TYPE_COLORS] ||
      'text-gray-600 bg-gray-100';

    return <Badge className={colorClass}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-2 text-sm text-gray-600'>사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return (
      <div className='py-12 text-center'>
        <div className='mb-2 text-lg text-gray-500'>사용자가 없습니다</div>
        <p className='text-sm text-gray-400'>검색 조건을 변경해보세요.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className='space-y-4'>
      {/* 일괄 작업 */}
      {selectedUsers.length > 0 && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-blue-700'>{selectedUsers.length}명 선택됨</span>
            <div className='flex items-center space-x-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleBulkStatusUpdate('ACTIVE')}
                disabled={bulkUpdateStatusMutation.isPending}
              >
                <UserCheck className='mr-1 h-4 w-4' />
                활성화
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleBulkStatusUpdate('INACTIVE')}
                disabled={bulkUpdateStatusMutation.isPending}
              >
                <UserMinus className='mr-1 h-4 w-4' />
                비활성화
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleBulkStatusUpdate('SUSPENDED')}
                disabled={bulkUpdateStatusMutation.isPending}
              >
                <UserX className='mr-1 h-4 w-4' />
                정지
              </Button>
              <Button size='sm' variant='outline' onClick={() => setSelectedUsers([])}>
                선택 해제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={selectedUsers.length === data.users.length && data.users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>사용자 정보</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>성별</TableHead>
              <TableHead>언어</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>최근 로그인</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => (
              <TableRow key={user.id} className={isFetching ? 'opacity-50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked: boolean) => handleSelectUser(user.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='font-medium text-gray-900'>
                      {user.displayName || user.name || user.nickName || '-'}
                    </div>
                    <div className='text-sm text-gray-500'>{user.email || '-'}</div>
                    {user.phoneNumber && (
                      <div className='text-sm text-gray-500'>{user.phoneNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(user.userStatusType || 'ACTIVE')}</TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {USER_ROLE_TYPE_LABELS[user.drRoleType as keyof typeof USER_ROLE_TYPE_LABELS] ||
                      '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {USER_GENDER_TYPE_LABELS[
                    user.genderType as keyof typeof USER_GENDER_TYPE_LABELS
                  ] || '-'}
                </TableCell>
                <TableCell>
                  {USER_LOCALE_LABELS[user.locale as keyof typeof USER_LOCALE_LABELS] || '-'}
                </TableCell>
                <TableCell>
                  <div className='text-sm'>{formatDate(user.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    {formatDate(user.last_sign_in_at || user.loggedInAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className='mr-2 h-4 w-4' />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className='mr-2 h-4 w-4' />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            총 {data.total}명 중 {(page - 1) * data.limit + 1}-
            {Math.min(page * data.limit, data.total)}명 표시
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              이전
            </Button>
            <span className='text-sm text-gray-700'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 수정 다이얼로그 */}
      <UserEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSubmit={async (data: CreateUserRequest | UpdateUserRequest) => {
          if (editingUser) {
            try {
              await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: data as UpdateUserRequest,
              });
              setIsEditDialogOpen(false);
              setEditingUser(null);
            } catch (error) {
              console.error('Failed to update user:', error);
            }
          }
        }}
        isLoading={updateUserMutation.isPending}
        mode='edit'
        user={editingUser}
      />
    </div>
  );
}
