'use client';

import { Checkbox, TableHead, TableHeader, TableRow } from '@/shared/ui';
import { type CheckedState } from '@radix-ui/react-checkbox';
import { Loader2 } from 'lucide-react';

interface UserTableHeaderRowProps {
  allSelected: boolean;
  hasUsers: boolean;
  onSelectAll: (checked: boolean) => void;
  isFetching: boolean;
}

export function UserTableHeaderRow({
  allSelected,
  hasUsers,
  onSelectAll,
  isFetching,
}: UserTableHeaderRowProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className='w-12'>
          <Checkbox
            checked={allSelected && hasUsers}
            onCheckedChange={(value: CheckedState) => onSelectAll(value === true)}
          />
        </TableHead>
        <TableHead>사용자 정보</TableHead>
        <TableHead>상태</TableHead>
        <TableHead>성별</TableHead>
        <TableHead>언어</TableHead>
        <TableHead>마케팅 정보</TableHead>
        <TableHead>가입일</TableHead>
        <TableHead>최근 로그인</TableHead>
        <TableHead className='w-12'>
          {isFetching && <Loader2 className='h-4 w-4 animate-spin' />}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
