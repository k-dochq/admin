'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Prisma, ReservationStatus, PaymentStatus } from '@prisma/client';
import { ReservationForList } from '@/features/reservation-management/api';

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

interface ReservationDetailDialogProps {
  reservation: ReservationForList | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ReservationDetailDialog({
  reservation,
  open,
  onOpenChange,
}: ReservationDetailDialogProps) {
  if (!reservation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>예약 정보를 찾을 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const userName = reservation.user.displayName || reservation.user.name || '-';
  const hospitalName = getLocalizedText(reservation.hospital.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>예약 상세 정보</DialogTitle>
          <DialogDescription>
            예약 ID: {reservation.id} •{' '}
            {new Date(reservation.createdAt).toLocaleDateString('ko-KR')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 기본 정보 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>예약 상태</h3>
              <div>{getStatusBadge(reservation.status)}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>예약 ID</h3>
              <div className='font-mono text-sm'>{reservation.id}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>사용자 정보</h3>
              <div className='space-y-1'>
                <div className='font-medium'>{userName}</div>
                {reservation.user.email && (
                  <div className='text-sm text-gray-500'>{reservation.user.email}</div>
                )}
                {reservation.user.phoneNumber && (
                  <div className='text-sm text-gray-500'>{reservation.user.phoneNumber}</div>
                )}
              </div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>병원 정보</h3>
              <div className='font-medium'>{hospitalName}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>시술명</h3>
              <div className='font-medium'>{reservation.procedureName}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>예약일시</h3>
              <div>
                <div>{new Date(reservation.reservationDate).toLocaleDateString('ko-KR')}</div>
                <div className='text-sm text-gray-500'>{reservation.reservationTime}</div>
              </div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>예약금액</h3>
              <div className='font-medium'>
                {formatCurrency(reservation.depositAmount, reservation.currency)}
              </div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>결제 마감일</h3>
              <div>
                {new Date(reservation.paymentDeadline).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            {reservation.cancelReason && (
              <div className='md:col-span-2'>
                <h3 className='mb-2 text-sm font-medium text-gray-500'>취소 사유</h3>
                <div className='rounded-lg bg-gray-50 p-3'>
                  <div className='text-sm'>{reservation.cancelReason}</div>
                </div>
              </div>
            )}
          </div>

          {/* 결제 정보 */}
          {reservation.payments.length > 0 && (
            <div>
              <h3 className='mb-4 text-sm font-medium text-gray-500'>
                결제 정보 ({reservation.payments.length}개)
              </h3>
              <div className='space-y-3'>
                {reservation.payments.map((payment) => (
                  <div key={payment.id} className='rounded-lg border p-4'>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      <div>
                        <div className='text-xs text-gray-500'>결제 ID</div>
                        <div className='font-mono text-sm'>{payment.id}</div>
                      </div>
                      <div>
                        <div className='text-xs text-gray-500'>TID</div>
                        <div className='font-mono text-sm'>{payment.tid || '-'}</div>
                      </div>
                      <div>
                        <div className='text-xs text-gray-500'>결제 금액</div>
                        <div className='font-medium'>
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-gray-500'>결제 상태</div>
                        <div>{getPaymentStatusBadge(payment.status)}</div>
                      </div>
                      <div>
                        <div className='text-xs text-gray-500'>생성일시</div>
                        <div className='text-sm'>
                          {new Date(payment.createdAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-gray-500'>수정일시</div>
                        <div className='text-sm'>
                          {new Date(payment.updatedAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결제 정보 없음 */}
          {reservation.payments.length === 0 && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>결제 정보</h3>
              <div className='rounded-lg border p-4 text-center text-gray-500'>
                결제 정보가 없습니다.
              </div>
            </div>
          )}

          {/* 메타데이터 */}
          <div className='border-t pt-4'>
            <div className='grid grid-cols-1 gap-2 text-sm text-gray-500 md:grid-cols-2'>
              <div>생성일시: {new Date(reservation.createdAt).toLocaleString('ko-KR')}</div>
              <div>수정일시: {new Date(reservation.updatedAt).toLocaleString('ko-KR')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
