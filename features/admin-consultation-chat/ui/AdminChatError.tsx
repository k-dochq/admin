'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminChatErrorProps {
  error: string;
  onRetry?: () => void;
}

export function AdminChatError({ error, onRetry }: AdminChatErrorProps) {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='max-w-md text-center'>
        <AlertCircle className='text-destructive mx-auto mb-4 h-12 w-12' />
        <h2 className='text-foreground mb-2 text-lg font-semibold'>채팅방 연결 오류</h2>
        <p className='text-muted-foreground mb-6'>{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant='outline' className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
