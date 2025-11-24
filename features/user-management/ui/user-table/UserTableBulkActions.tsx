'use client';

import { Button } from '@/shared/ui';
import { UserCheck, UserMinus, UserX } from 'lucide-react';

interface UserTableBulkActionsProps {
  selectedCount: number;
  onBulkStatusUpdate: (status: string) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export function UserTableBulkActions({
  selectedCount,
  onBulkStatusUpdate,
  onClearSelection,
  isProcessing,
}: UserTableBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-blue-700'>{selectedCount}명 선택됨</span>
        <div className='flex items-center space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onBulkStatusUpdate('ACTIVE')}
            disabled={isProcessing}
          >
            <UserCheck className='mr-1 h-4 w-4' />
            활성화
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onBulkStatusUpdate('INACTIVE')}
            disabled={isProcessing}
          >
            <UserMinus className='mr-1 h-4 w-4' />
            비활성화
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onBulkStatusUpdate('SUSPENDED')}
            disabled={isProcessing}
          >
            <UserX className='mr-1 h-4 w-4' />
            정지
          </Button>
          <Button size='sm' variant='outline' onClick={onClearSelection}>
            선택 해제
          </Button>
        </div>
      </div>
    </div>
  );
}
