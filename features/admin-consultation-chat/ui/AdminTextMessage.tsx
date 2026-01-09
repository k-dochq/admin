'use client';

import React from 'react';
import { MessageBubble, MessageTail, MessageTime } from '@/shared/ui/message-bubble';
import { parseCombinedMessage } from '@/shared/lib/message-parser';
import { AdminMessageHeader } from './AdminMessageHeader';

interface AdminTextMessageProps {
  content: string;
  formattedTime: string;
  returnUrl?: string;
  showHeader?: boolean;
  isRead?: boolean;
  adminName?: string;
}

export function AdminTextMessage({
  content,
  formattedTime,
  returnUrl,
  showHeader = true,
  isRead,
  adminName,
}: AdminTextMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
      <AdminMessageHeader showHeader={showHeader} adminName={adminName} />
      <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
        <div className='relative flex min-w-0 shrink-0 items-start justify-start'>
          <div className='relative flex shrink-0 items-center justify-center'>
            <div className='flex-none scale-y-[-100%]'>
              <MessageTail variant='hospital' />
            </div>
          </div>
          <MessageBubble variant='hospital' className='self-stretch'>
            <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] break-words whitespace-pre-wrap text-neutral-900 not-italic">
              {parseCombinedMessage({
                message: content,
                returnUrl,
              }).map((item, index) => {
                if (typeof item === 'string') {
                  return <span key={`text-${index}`}>{item}</span>;
                }
                // React 요소는 이미 key가 있으므로 그대로 반환
                return item;
              })}
            </div>
          </MessageBubble>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <MessageTime time={formattedTime} />
          {isRead && <span className='text-xs text-blue-500'>읽음</span>}
        </div>
      </div>
    </div>
  );
}
