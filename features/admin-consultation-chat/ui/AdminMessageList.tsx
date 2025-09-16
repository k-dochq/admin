'use client';

import { useEffect, useRef } from 'react';
import { AdminMessageBubble } from './AdminMessageBubble';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminMessageListProps {
  messages: AdminChatMessage[];
}

export function AdminMessageList({ messages }: AdminMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 올 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-muted-foreground text-center'>
          <p className='text-lg'>아직 대화가 시작되지 않았습니다.</p>
          <p className='text-sm'>사용자와 대화를 시작해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto p-4'>
      <div className='space-y-4'>
        {messages.map((message) => (
          <AdminMessageBubble
            key={message.id}
            message={message}
            isFromAdmin={message.senderType === 'ADMIN'}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
