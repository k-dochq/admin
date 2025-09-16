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

  // 연속된 같은 발신자의 메시지인지 확인
  const shouldShowHeader = (currentIndex: number): boolean => {
    if (currentIndex === 0) return true;
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    return (
      currentMessage.senderType !== previousMessage.senderType ||
      currentMessage.senderType === 'ADMIN'
    ); // Admin 메시지는 항상 헤더 표시
  };

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='flex flex-col content-stretch items-start justify-start gap-2 p-5'>
        {messages.map((message, index) => (
          <div key={message.id} className='w-full'>
            <AdminMessageBubble
              message={message}
              isFromAdmin={message.senderType === 'ADMIN'}
              showHeader={shouldShowHeader(index)}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
