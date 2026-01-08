'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FileText, MessageSquare, Mail } from 'lucide-react';

interface AdminChatHeaderProps {
  hospitalName: string;
  userName: string;
  hospitalImageUrl?: string;
  medicalSpecialties?: Array<{
    id: string;
    specialtyType: string;
    name: string;
  }>;
  isConnected: boolean;
  typingUsers: string[];
  onCreateReservation?: () => void;
  onCreateMedicalSurvey?: () => void;
  onSendNotificationEmail?: () => void;
  onOpenMemo?: () => void;
}

export function AdminChatHeader({
  hospitalName,
  userName,
  hospitalImageUrl,
  medicalSpecialties = [],
  isConnected,
  typingUsers,
  onCreateReservation,
  onCreateMedicalSurvey,
  onSendNotificationEmail,
  onOpenMemo,
}: AdminChatHeaderProps) {
  // 시술부위 이름들을 쉼표로 구분하여 표시
  const specialtyNames = medicalSpecialties.map((specialty) => specialty.name).join(', ');

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
          {hospitalImageUrl && (
            <img
              src={hospitalImageUrl}
              alt={hospitalName}
              className='h-6 w-6 flex-shrink-0 rounded-full object-cover sm:h-8 sm:w-8'
            />
          )}
          <div className='min-w-0 flex-1'>
            <div className='flex min-w-0 flex-wrap items-center gap-1 sm:gap-2'>
              <h1 className='truncate text-base font-semibold sm:text-lg'>{hospitalName}</h1>
              {specialtyNames && (
                <span className='text-muted-foreground hidden truncate text-xs sm:inline sm:text-sm'>
                  ({specialtyNames})
                </span>
              )}
            </div>
            <div className='flex min-w-0 flex-wrap items-center gap-1 sm:gap-2'>
              <Badge variant='outline' className='text-[10px] sm:text-xs'>
                {userName}
              </Badge>
              {isConnected ? (
                <Badge variant='default' className='bg-green-500 text-[10px] sm:text-xs'>
                  연결됨
                </Badge>
              ) : (
                <Badge variant='destructive' className='text-[10px] sm:text-xs'>
                  연결 끊김
                </Badge>
              )}
              {typingUsers.length > 0 && (
                <Badge variant='secondary' className='truncate text-[10px] sm:text-xs'>
                  {typingUsers.join(', ')}이(가) 입력 중...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
        {onOpenMemo && (
          <Button
            onClick={onOpenMemo}
            size='sm'
            variant='outline'
            className='flex items-center gap-1 text-xs sm:gap-2 sm:text-sm'
          >
            <FileText className='h-3 w-3 sm:h-4 sm:w-4' />
            <span className='hidden sm:inline'>메모</span>
          </Button>
        )}
        {onCreateMedicalSurvey && (
          <Button
            onClick={onCreateMedicalSurvey}
            size='sm'
            variant='outline'
            className='flex items-center gap-1 text-xs sm:gap-2 sm:text-sm'
          >
            <MessageSquare className='h-3 w-3 sm:h-4 sm:w-4' />
            <span className='hidden sm:inline'>질문생성</span>
          </Button>
        )}
        {onSendNotificationEmail && (
          <Button
            onClick={onSendNotificationEmail}
            size='sm'
            variant='outline'
            className='flex items-center gap-1 text-xs sm:gap-2 sm:text-sm'
          >
            <Mail className='h-3 w-3 sm:h-4 sm:w-4' />
            <span className='hidden sm:inline'>확인메일발송</span>
          </Button>
        )}
        {onCreateReservation && (
          <Button
            onClick={onCreateReservation}
            size='sm'
            className='flex items-center gap-1 text-xs sm:gap-2 sm:text-sm'
          >
            <CalendarIcon className='h-3 w-3 sm:h-4 sm:w-4' />
            <span className='hidden sm:inline'>예약 생성</span>
          </Button>
        )}
      </div>
    </div>
  );
}
