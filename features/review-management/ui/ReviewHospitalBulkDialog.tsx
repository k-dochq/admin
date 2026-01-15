'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReviewHospitalBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: boolean;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ReviewHospitalBulkDialog({
  open,
  onOpenChange,
  isActive,
  onConfirm,
  isProcessing,
}: ReviewHospitalBulkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>병원별 리뷰 일괄 처리</DialogTitle>
          <DialogDescription>
            선택한 병원의 모든 리뷰를 {isActive ? '활성화' : '숨김'} 처리하시겠습니까?
            <br />이 작업은 되돌릴 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant='default' onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? '처리 중...' : isActive ? '활성화' : '숨김'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
