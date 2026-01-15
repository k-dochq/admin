'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReviewDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function ReviewDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: ReviewDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리뷰 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
