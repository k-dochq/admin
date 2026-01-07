'use client';

import { useEffect, useRef } from 'react';
import { AdminMessageBubble } from './AdminMessageBubble';
import { LoadOlderButton } from './LoadOlderButton';
import { MessageDateSeparator } from './MessageDateSeparator';
import { formatMessageDate, isSameDay } from '../lib/admin-chat-utils';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminMessageListProps {
  messages: AdminChatMessage[];
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
}

export function AdminMessageList({ messages, hasMore, onLoadMore }: AdminMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPrependingRef = useRef(false);
  const initialScrolledRef = useRef(false);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // 이전 메시지 로드 중이면 스크롤하지 않음
    if (isPrependingRef.current) return;

    // 초기 로드 시 한 번만 스크롤
    if (!initialScrolledRef.current) {
      scrollToBottom();
      initialScrolledRef.current = true;
      return;
    }

    // 새 메시지가 추가되었을 때 자동 스크롤
    scrollToBottom();
  }, [messages]);

  const handleLoadMoreClick = async () => {
    if (!onLoadMore || !containerRef.current) {
      return;
    }
    const el = containerRef.current;
    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;
    isPrependingRef.current = true;
    await onLoadMore();
    // 메시지 추가 후 높이 차이만큼 보정하여 같은 위치 유지
    const newScrollHeight = el.scrollHeight;
    el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
    isPrependingRef.current = false;
  };

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

  // 날짜 구분자를 표시해야 하는지 확인
  const shouldShowDateSeparator = (currentIndex: number): boolean => {
    if (currentIndex === 0) return true; // 첫 번째 메시지는 항상 날짜 표시
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    return !isSameDay(previousMessage.timestamp, currentMessage.timestamp);
  };

  return (
    <div ref={containerRef} className='min-w-0 flex-1 overflow-y-auto'>
      <LoadOlderButton hasMore={hasMore} onClick={handleLoadMoreClick} />
      <div className='flex min-w-0 flex-col content-stretch items-start justify-start gap-2 p-3 sm:p-5'>
        {messages.map((message, index) => {
          const showDateSeparator = shouldShowDateSeparator(index);

          return (
            <div key={message.id} className='w-full'>
              {/* 날짜 구분자 */}
              {showDateSeparator && (
                <MessageDateSeparator date={formatMessageDate(message.timestamp)} />
              )}

              {/* 메시지 */}
              <AdminMessageBubble
                message={message}
                isFromAdmin={message.senderType === 'ADMIN'}
                showHeader={shouldShowHeader(index)}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
