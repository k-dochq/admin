'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import {
  MARKETING_FIELD_LABELS,
  type MarketingAttributionData,
  formatMarketingTimestamp,
} from '@/features/user-management/lib/marketingAttribution';
import { type UserWithDetails } from '@/lib/types/user';

interface MarketingAttributionDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserWithDetails | null;
  data: MarketingAttributionData | null;
}

export function MarketingAttributionDialog({
  open,
  onClose,
  user,
  data,
}: MarketingAttributionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>마케팅 어트리뷰션 정보</DialogTitle>
          <p className='text-sm text-gray-500'>
            {user?.displayName || user?.name || user?.email || '사용자 정보'}
          </p>
        </DialogHeader>

        {data ? (
          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              {MARKETING_FIELD_LABELS.map(({ key, label }) => (
                <div key={key} className='rounded-md border border-gray-100 p-3'>
                  <p className='text-xs font-medium text-gray-500 uppercase'>{label}</p>
                  <p className='mt-1 text-sm break-all text-gray-900'>{data[key] || '-'}</p>
                </div>
              ))}
            </div>

            <div className='rounded-md bg-gray-50 p-3'>
              <p className='text-xs font-medium text-gray-500 uppercase'>최초 접속 시각</p>
              <p className='mt-1 text-sm text-gray-900'>{formatMarketingTimestamp(data.ts)}</p>
              {data.ts && <p className='text-xs text-gray-500'>Unix Timestamp: {data.ts}</p>}
            </div>
          </div>
        ) : (
          <p className='text-sm text-gray-500'>저장된 마케팅 어트리뷰션 정보가 없습니다.</p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
