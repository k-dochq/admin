'use client';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff, X } from 'lucide-react';

interface ReviewBulkActionsProps {
  selectedCount: number;
  onBulkUpdate: (isActive: boolean) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export function ReviewBulkActions({
  selectedCount,
  onBulkUpdate,
  onClearSelection,
  isProcessing,
}: ReviewBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-blue-700'>{selectedCount}개 리뷰 선택됨</span>
        <div className='flex items-center space-x-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onBulkUpdate(true)}
            disabled={isProcessing}
          >
            <Eye className='mr-1 h-4 w-4' />
            활성화
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onBulkUpdate(false)}
            disabled={isProcessing}
          >
            <EyeOff className='mr-1 h-4 w-4' />
            숨김
          </Button>
          <Button size='sm' variant='outline' onClick={onClearSelection} disabled={isProcessing}>
            <X className='mr-1 h-4 w-4' />
            선택 해제
          </Button>
        </div>
      </div>
    </div>
  );
}
