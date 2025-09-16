'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AdminChatRoomErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function AdminChatRoomErrorState({ onRetry, className = '' }: AdminChatRoomErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <AlertCircle className='text-destructive mb-4 h-12 w-12' />
      <h3 className='text-foreground mb-2 text-lg font-semibold'>
        채팅방을 불러오는 중 오류가 발생했습니다
      </h3>
      <p className='text-muted-foreground mb-6 text-center'>잠시 후 다시 시도해주세요</p>
      {onRetry && (
        <Button onClick={onRetry} variant='outline' className='gap-2'>
          <RefreshCw className='h-4 w-4' />
          다시 시도
        </Button>
      )}
    </div>
  );
}
