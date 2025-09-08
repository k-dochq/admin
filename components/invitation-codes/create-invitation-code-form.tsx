'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Plus } from 'lucide-react';
import { useCreateInvitationCode } from '@/lib/mutations/invitation-codes';
import type { CreateInvitationCodeRequest } from '@/lib/types/invitation-code';
import { InvitationCodeKind } from '@/lib/types/common';
import { toast } from 'sonner';

export function CreateInvitationCodeForm() {
  const [kind, setKind] = useState<InvitationCodeKind>(InvitationCodeKind.VIP);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const createMutation = useCreateInvitationCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData: CreateInvitationCodeRequest = {
      kind,
      ...(kind === InvitationCodeKind.PAYMENT_REFERENCE && { expiresInDays }),
    };

    try {
      const result = await createMutation.mutateAsync(requestData);
      toast.success(`초대코드가 성공적으로 생성되었습니다: ${result.data?.code}`);
      // 폼 초기화
      setKind(InvitationCodeKind.VIP);
      setExpiresInDays(30);
    } catch (error) {
      console.error('Failed to create invitation code:', error);
      toast.error('초대코드 생성에 실패했습니다.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Gift className='h-5 w-5' />
          초대코드 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='kind'>초대코드 타입</Label>
            <Select value={kind} onValueChange={(value: InvitationCodeKind) => setKind(value)}>
              <SelectTrigger>
                <SelectValue placeholder='초대코드 타입을 선택하세요' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvitationCodeKind.VIP}>VIP 인비테이션 코드</SelectItem>
                <SelectItem value={InvitationCodeKind.PAYMENT_REFERENCE}>
                  멤버십 비용 지불 레퍼런스 코드
                </SelectItem>
              </SelectContent>
            </Select>
            <p className='text-sm text-gray-500'>
              {kind === InvitationCodeKind.VIP
                ? 'VIP 코드는 만료되지 않으며 1회만 사용 가능합니다.'
                : 'Payment Reference 코드는 설정된 기간 후 만료됩니다.'}
            </p>
          </div>

          {kind === InvitationCodeKind.PAYMENT_REFERENCE && (
            <div className='space-y-2'>
              <Label htmlFor='expiresInDays'>만료 기간 (일)</Label>
              <Input
                id='expiresInDays'
                type='number'
                min='1'
                max='365'
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                placeholder='30'
              />
              <p className='text-sm text-gray-500'>
                초대코드가 생성된 후 {expiresInDays}일 후에 만료됩니다.
              </p>
            </div>
          )}

          <Button type='submit' disabled={createMutation.isPending} className='w-full'>
            {createMutation.isPending ? (
              '생성 중...'
            ) : (
              <>
                <Plus className='mr-2 h-4 w-4' />
                초대코드 생성
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
