'use client';

import { MessageSquare } from 'lucide-react';

export function AdminChatLoading() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <MessageSquare className='text-muted-foreground mx-auto mb-4 h-12 w-12 animate-pulse' />
        <h2 className='text-foreground mb-2 text-lg font-semibold'>채팅방을 불러오는 중...</h2>
        <p className='text-muted-foreground'>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
