'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { type DoctorFormErrors } from '../model/types';

interface DoctorAdditionalSettingsProps {
  order: number | undefined;
  stop: boolean;
  approvalStatusType: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL';
  errors: DoctorFormErrors;
  onUpdateOrder: (value: number | undefined) => void;
  onUpdateStop: (value: boolean) => void;
  onUpdateApprovalStatusType: (
    value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL',
  ) => void;
}

export function DoctorAdditionalSettings({
  order,
  stop,
  approvalStatusType,
  errors,
  onUpdateOrder,
  onUpdateStop,
  onUpdateApprovalStatusType,
}: DoctorAdditionalSettingsProps) {
  return (
    <div className='space-y-4 border-t pt-4'>
      <Label className='text-base font-medium'>기타 설정</Label>

      {/* 순서 */}
      <div className='space-y-2'>
        <Label htmlFor='order'>순서</Label>
        <Input
          id='order'
          type='number'
          min='0'
          value={order || ''}
          onChange={(e) => {
            const value = e.target.value;
            onUpdateOrder(value ? parseInt(value, 10) : undefined);
          }}
          placeholder='정렬 순서 (숫자)'
          className={errors.order ? 'border-destructive' : ''}
        />
        {errors.order && <p className='text-destructive text-sm'>{errors.order}</p>}
      </div>

      {/* 활동 상태 */}
      <div className='flex items-center space-x-2'>
        <Switch id='stop' checked={!stop} onCheckedChange={(checked) => onUpdateStop(!checked)} />
        <Label htmlFor='stop'>활성 상태</Label>
      </div>

      {/* 승인 상태 */}
      <div className='space-y-2'>
        <Label htmlFor='approval-status'>승인 상태</Label>
        <Select value={approvalStatusType} onValueChange={onUpdateApprovalStatusType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='PENDING'>대기</SelectItem>
            <SelectItem value='APPROVED'>승인</SelectItem>
            <SelectItem value='REJECTED'>거부</SelectItem>
            <SelectItem value='WAITING_APPROVAL'>승인대기</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
