'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

interface AdminChatHeaderProps {
  hospitalName: string;
  userName: string;
  hospitalImageUrl?: string;
  isConnected: boolean;
  typingUsers: string[];
  onCreateReservation?: () => void;
}

export function AdminChatHeader({
  hospitalName,
  userName,
  hospitalImageUrl,
  isConnected,
  typingUsers,
  onCreateReservation,
}: AdminChatHeaderProps) {
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-3'>
          {hospitalImageUrl && (
            <img
              src={hospitalImageUrl}
              alt={hospitalName}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
          <div>
            <h1 className='text-lg font-semibold'>{hospitalName}</h1>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'>{userName}</Badge>
              {isConnected ? (
                <Badge variant='default' className='bg-green-500'>
                  연결됨
                </Badge>
              ) : (
                <Badge variant='destructive'>연결 끊김</Badge>
              )}
              {typingUsers.length > 0 && (
                <Badge variant='secondary'>{typingUsers.join(', ')}이(가) 입력 중...</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {onCreateReservation && (
        <Button onClick={onCreateReservation} size='sm' className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4' />
          예약 생성
        </Button>
      )}
    </div>
  );
}
