'use client';

import { useState } from 'react';
import { Table, TableBody } from '@/shared/ui';
import {
  GetUsersResponse,
  UserWithDetails,
  UpdateUserRequest,
  CreateUserRequest,
  USER_STATUS_TYPE_LABELS,
} from '@/lib/types/user';
import { useDeleteUser, useBulkUpdateUserStatus, useUpdateUser } from '@/lib/queries/users';
import { UserEditDialog } from './UserEditDialog';
import { UserTableBulkActions } from './user-table/UserTableBulkActions';
import { UserTableHeaderRow } from './user-table/UserTableHeaderRow';
import { UserTableRow } from './user-table/UserTableRow';
import { UserTablePagination } from './user-table/UserTablePagination';
import { UserTableEmptyState } from './user-table/UserTableEmptyState';
import { UserTableLoadingState } from './user-table/UserTableLoadingState';
import { MarketingAttributionDialog } from './user-table/MarketingAttributionDialog';
import { type MarketingAttributionData } from '@/features/user-management/lib/marketingAttribution';

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
  const [marketingDialogOpen, setMarketingDialogOpen] = useState(false);
  const [selectedMarketingUser, setSelectedMarketingUser] = useState<UserWithDetails | null>(null);
  const [selectedMarketingData, setSelectedMarketingData] =
    useState<MarketingAttributionData | null>(null);

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

  const handleOpenMarketingDialog = (
    user: UserWithDetails,
    marketingData: MarketingAttributionData | null,
  ) => {
    if (!marketingData) {
      return;
    }

    setSelectedMarketingUser(user);
    setSelectedMarketingData(marketingData);
    setMarketingDialogOpen(true);
  };

  const handleCloseMarketingDialog = () => {
    setMarketingDialogOpen(false);
    setSelectedMarketingUser(null);
    setSelectedMarketingData(null);
  };

  if (isLoading && !data) {
    return <UserTableLoadingState />;
  }

  if (!data || data.users.length === 0) {
    return <UserTableEmptyState />;
  }

  const hasUsers = data.users.length > 0;
  const allSelected = selectedUsers.length === data.users.length && hasUsers;

  return (
    <div className='space-y-4'>
      <UserTableBulkActions
        selectedCount={selectedUsers.length}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onClearSelection={() => setSelectedUsers([])}
        isProcessing={bulkUpdateStatusMutation.isPending}
      />

      <div
        className={`overflow-hidden rounded-lg border transition-opacity ${isFetching ? 'opacity-60' : ''}`}
      >
        <Table>
          <UserTableHeaderRow
            allSelected={allSelected}
            hasUsers={hasUsers}
            onSelectAll={handleSelectAll}
            isFetching={isFetching}
          />
          <TableBody>
            {data.users.map((user) => {
              return (
                <UserTableRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onSelectUser={handleSelectUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onOpenMarketingDialog={handleOpenMarketingDialog}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>

      <UserTablePagination
        page={page}
        limit={data.limit}
        total={data.total}
        onPageChange={onPageChange}
        isFetching={isFetching}
      />

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
      <MarketingAttributionDialog
        open={marketingDialogOpen}
        onClose={handleCloseMarketingDialog}
        user={selectedMarketingUser}
        data={selectedMarketingData}
      />
    </div>
  );
}
