'use client';

import React from 'react';
import { MessageBubble, MessageTail, MessageTime } from '@/shared/ui/message-bubble';
import { parseCombinedMessage } from '@/shared/lib/message-parser';

interface UserTextMessageProps {
  content: string;
  formattedTime: string;
  returnUrl?: string;
}

export function UserTextMessage({ content, formattedTime, returnUrl }: UserTextMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-end gap-1 sm:flex-row sm:items-end sm:justify-end sm:gap-2'>
      <div className='relative flex max-w-[85%] min-w-0 shrink-0 items-end justify-end sm:max-w-[80%]'>
        <div className='flex flex-row items-end justify-end'>
          <MessageBubble variant='user' className='h-full items-end justify-start'>
            <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] break-words whitespace-pre-wrap text-neutral-50 not-italic">
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
        <MessageTail variant='user' />
      </div>
      <MessageTime time={formattedTime} />
    </div>
  );
}
