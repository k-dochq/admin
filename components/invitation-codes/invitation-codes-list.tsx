'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Copy, Check, Filter } from 'lucide-react';
import { useInvitationCodes } from '@/lib/queries/invitation-codes';
import { useDeleteInvitationCode } from '@/lib/mutations/invitation-codes';
import type { InvitationCode } from '@/lib/types/invitation-code';
import { InvitationCodeKind } from '@/lib/types/common';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/shared/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function InvitationCodesList() {
  const { data, isLoading, error } = useInvitationCodes();
  const deleteMutation = useDeleteInvitationCode();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<InvitationCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string>('all');

  // 로딩 상태 처리
  if (isLoading) {
    return <LoadingSpinner text='초대코드를 불러오는 중...' />;
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>초대코드 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='text-destructive'>데이터를 불러오는 중 오류가 발생했습니다.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allInvitationCodes = data?.data || [];

  // 필터링된 초대코드 목록
  const invitationCodes =
    filterKind === 'all'
      ? allInvitationCodes
      : allInvitationCodes.filter((code) => code.kind === filterKind);

  const handleDeleteClick = (code: InvitationCode) => {
    setSelectedCode(code);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCode) {
      try {
        await deleteMutation.mutateAsync(selectedCode.id);
        toast.success('초대코드가 성공적으로 삭제되었습니다.');
        setDeleteDialogOpen(false);
        setSelectedCode(null);
      } catch (_error) {
        toast.error('초대코드 삭제에 실패했습니다.');
      }
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('초대코드가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('초대코드 복사에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '만료 없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (code: InvitationCode) => {
    if (code.UsedBy) {
      return <Badge variant='secondary'>사용됨</Badge>;
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <Badge variant='destructive'>만료됨</Badge>;
    }

    return <Badge variant='default'>사용 가능</Badge>;
  };

  const getKindBadge = (kind: string) => {
    return kind === InvitationCodeKind.VIP ? (
      <Badge variant='default'>VIP</Badge>
    ) : (
      <Badge variant='outline'>Payment Reference</Badge>
    );
  };

  if (allInvitationCodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>초대코드 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-gray-500'>생성된 초대코드가 없습니다.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>초대코드 목록</CardTitle>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-gray-500' />
              <Select value={filterKind} onValueChange={setFilterKind}>
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='타입별 필터' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 ({allInvitationCodes.length})</SelectItem>
                  <SelectItem value={InvitationCodeKind.VIP}>
                    VIP (
                    {allInvitationCodes.filter((c) => c.kind === InvitationCodeKind.VIP).length})
                  </SelectItem>
                  <SelectItem value={InvitationCodeKind.PAYMENT_REFERENCE}>
                    Payment Reference (
                    {
                      allInvitationCodes.filter(
                        (c) => c.kind === InvitationCodeKind.PAYMENT_REFERENCE,
                      ).length
                    }
                    )
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invitationCodes.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>선택한 타입의 초대코드가 없습니다.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>코드</TableHead>
                  <TableHead>타입</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>만료일</TableHead>
                  <TableHead>사용자</TableHead>
                  <TableHead className='text-right'>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationCodes.map((code: InvitationCode) => (
                  <TableRow key={code.id}>
                    <TableCell className='font-mono'>
                      <div className='flex items-center gap-2'>
                        {code.code}
                        <Button variant='ghost' size='sm' onClick={() => handleCopyCode(code.code)}>
                          {copiedCode === code.code ? (
                            <Check className='h-4 w-4 text-green-500' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getKindBadge(code.kind)}</TableCell>
                    <TableCell>{getStatusBadge(code)}</TableCell>
                    <TableCell>{formatDate(code.createdAt)}</TableCell>
                    <TableCell>{formatDate(code.expiresAt)}</TableCell>
                    <TableCell>
                      {code.UsedBy ? (
                        <div>
                          <div className='font-medium'>{code.UsedBy.displayName || 'Unknown'}</div>
                          <div className='text-sm text-gray-500'>{code.UsedBy.email}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {!code.UsedBy && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteClick(code)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>초대코드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 초대코드 <span className='font-mono font-bold'>{selectedCode?.code}</span>를
              삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
