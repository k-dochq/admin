'use client';

import { MessageSquare } from 'lucide-react';

interface AdminChatRoomEmptyStateProps {
  className?: string;
}

export function AdminChatRoomEmptyState({ className = '' }: AdminChatRoomEmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <MessageSquare className='text-muted-foreground mb-4 h-12 w-12' />
      <h3 className='text-foreground mb-2 text-lg font-semibold'>상담 채팅방이 없습니다</h3>
      <p className='text-muted-foreground text-center'>아직 진행 중인 상담이 없습니다.</p>
    </div>
  );
}
