'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Eye, Loader2 } from 'lucide-react';
import { Prisma } from '@prisma/client';
import {
  type GetReservationsResponse,
  type ReservationForList,
} from '@/features/reservation-management/api';
import { LoadingSpinner } from '@/shared/ui';
import { ReservationStatus, PaymentStatus } from '@prisma/client';

interface ReservationTableProps {
  data?: GetReservationsResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onViewDetail: (reservation: ReservationForList) => void;
}

const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (
      (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
    );
  }
  return '';
};

const getStatusBadge = (status: ReservationStatus) => {
  const statusMap: Record<
    ReservationStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    PENDING: { label: '대기중', variant: 'outline' },
    PAYMENT_PENDING: { label: '결제 대기', variant: 'secondary' },
    CONFIRMED: { label: '확정', variant: 'default' },
    COMPLETED: { label: '완료', variant: 'default' },
    CANCELLED: { label: '취소', variant: 'destructive' },
  };

  const statusInfo = statusMap[status];
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

const getPaymentStatusBadge = (status: PaymentStatus) => {
  const statusMap: Record<
    PaymentStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    PENDING: { label: '대기중', variant: 'outline' },
    PROCESSING: { label: '처리중', variant: 'secondary' },
    SUCCEEDED: { label: '성공', variant: 'default' },
    FAILED: { label: '실패', variant: 'destructive' },
    REFUNDED: { label: '환불', variant: 'destructive' },
  };

  const statusInfo = statusMap[status];
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export function ReservationTable({
  data,
  isLoading,
  isFetching,
  page,
  onPageChange,
  onViewDetail,
}: ReservationTableProps) {
  const limit = 20;
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Calendar className='mr-2 h-5 w-5' />
          예약 목록 ({total}개)
          {isFetching && <Loader2 className='text-muted-foreground ml-2 h-4 w-4 animate-spin' />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 로딩 중이고 데이터가 없을 때만 테이블 스켈레톤 표시 */}
        {isLoading && !data ? (
          <LoadingSpinner size='sm' text='데이터를 새로고침하는 중...' />
        ) : (
          <>
            <div
              className={`rounded-md border transition-opacity ${isFetching ? 'opacity-60' : ''}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>예약 ID</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>병원</TableHead>
                    <TableHead>시술명</TableHead>
                    <TableHead>예약일시</TableHead>
                    <TableHead>예약금액</TableHead>
                    <TableHead>결제상태</TableHead>
                    <TableHead>예약상태</TableHead>
                    <TableHead>생성일시</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className='py-8 text-center text-gray-500'>
                        예약 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.reservations.map((reservation) => {
                      const latestPayment = reservation.payments[0];
                      const userName = reservation.user.displayName || reservation.user.name || '-';
                      const hospitalName = getLocalizedText(reservation.hospital.name);

                      return (
                        <TableRow key={reservation.id}>
                          <TableCell className='font-mono text-xs'>
                            {reservation.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className='font-medium'>{userName}</div>
                              {reservation.user.email && (
                                <div className='text-sm text-gray-500'>
                                  {reservation.user.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='font-medium'>{hospitalName}</div>
                          </TableCell>
                          <TableCell>{reservation.procedureName}</TableCell>
                          <TableCell>
                            <div>
                              <div>
                                {new Date(reservation.reservationDate).toLocaleDateString('ko-KR')}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {reservation.reservationTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(reservation.depositAmount, reservation.currency)}
                          </TableCell>
                          <TableCell>
                            {latestPayment ? (
                              getPaymentStatusBadge(latestPayment.status)
                            ) : (
                              <Badge variant='outline'>결제 없음</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                          <TableCell>
                            {new Date(reservation.createdAt).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onViewDetail(reservation)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between pt-4'>
                <div className='text-sm text-gray-500'>
                  {total}개 중 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}개 표시
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || isFetching}
                  >
                    이전
                  </Button>
                  <div className='flex items-center gap-1'>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => onPageChange(pageNum)}
                          disabled={isFetching}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || isFetching}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
