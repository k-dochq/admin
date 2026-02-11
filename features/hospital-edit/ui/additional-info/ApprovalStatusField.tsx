'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ApprovalStatusFieldProps {
  value?: 'PENDING' | 'APPROVED' | 'REJECTED';
  onChange?: (value: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
}

export function ApprovalStatusField({ value = 'APPROVED', onChange }: ApprovalStatusFieldProps) {
  return (
    <div>
      <Label htmlFor='approvalStatusType'>승인 상태</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange?.(v as 'PENDING' | 'APPROVED' | 'REJECTED')}
      >
        <SelectTrigger>
          <SelectValue placeholder='승인 상태를 선택하세요' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='PENDING'>PENDING</SelectItem>
          <SelectItem value='APPROVED'>APPROVED</SelectItem>
          <SelectItem value='REJECTED'>REJECTED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
