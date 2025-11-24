'use client';

import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TableCell,
  TableRow,
  Badge,
} from '@/shared/ui';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  USER_GENDER_TYPE_LABELS,
  USER_LOCALE_LABELS,
  USER_STATUS_TYPE_LABELS,
  USER_STATUS_TYPE_COLORS,
  type UserWithDetails,
} from '@/lib/types/user';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  extractMarketingAttribution,
  type MarketingAttributionData,
} from '@/features/user-management/lib/marketingAttribution';
import { type CheckedState } from '@radix-ui/react-checkbox';

interface UserTableRowProps {
  user: UserWithDetails;
  isSelected: boolean;
  onSelectUser: (userId: string, checked: boolean) => void;
  onEditUser: (user: UserWithDetails) => void;
  onDeleteUser: (userId: string) => void;
  onOpenMarketingDialog: (user: UserWithDetails, data: MarketingAttributionData | null) => void;
}

const formatDate = (date: Date | null | undefined) => {
  if (!date) return '-';
  return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko });
};

export function UserTableRow({
  user,
  isSelected,
  onSelectUser,
  onEditUser,
  onDeleteUser,
  onOpenMarketingDialog,
}: UserTableRowProps) {
  const marketingData = extractMarketingAttribution(user);
  const statusLabel = USER_STATUS_TYPE_LABELS[user.userStatusType || 'ACTIVE'];
  const statusColor =
    USER_STATUS_TYPE_COLORS[user.userStatusType || 'ACTIVE'] || 'text-gray-600 bg-gray-100';

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked: CheckedState) => onSelectUser(user.id, checked === true)}
        />
      </TableCell>
      <TableCell>
        <div className='space-y-1'>
          <div className='font-medium text-gray-900'>
            {user.displayName || user.name || user.nickName || '-'}
          </div>
          <div className='text-sm text-gray-500'>{user.email || '-'}</div>
          {user.phoneNumber && <div className='text-sm text-gray-500'>{user.phoneNumber}</div>}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={statusColor}>{statusLabel}</Badge>
      </TableCell>
      <TableCell>
        {USER_GENDER_TYPE_LABELS[user.genderType as keyof typeof USER_GENDER_TYPE_LABELS] || '-'}
      </TableCell>
      <TableCell>
        {USER_LOCALE_LABELS[user.locale as keyof typeof USER_LOCALE_LABELS] || '-'}
      </TableCell>
      <TableCell>
        <Button
          size='sm'
          variant='outline'
          disabled={!marketingData}
          onClick={() => onOpenMarketingDialog(user, marketingData)}
        >
          마케팅 정보
        </Button>
      </TableCell>
      <TableCell>
        <div className='text-sm'>{formatDate(user.createdAt)}</div>
      </TableCell>
      <TableCell>
        <div className='text-sm'>{formatDate(user.last_sign_in_at || user.loggedInAt)}</div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              <Edit className='mr-2 h-4 w-4' />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteUser(user.id)}>
              <Trash2 className='mr-2 h-4 w-4' />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
