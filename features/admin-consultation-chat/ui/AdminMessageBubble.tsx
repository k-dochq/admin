'use client';

import { MessageBubble, MessageTail, MessageTime } from '@/shared/ui/message-bubble';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminMessageBubbleProps {
  message: AdminChatMessage;
  isFromAdmin: boolean;
  showHeader?: boolean;
}

export function AdminMessageBubble({
  message,
  isFromAdmin,
  showHeader = true,
}: AdminMessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedTime = formatTime(message.timestamp);

  if (isFromAdmin) {
    // Admin 메시지 (k-doc의 HospitalMessage 스타일)
    return (
      <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
        {showHeader && (
          <div className='flex items-center gap-2'>
            <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
              관리자
            </span>
          </div>
        )}
        <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
          <div className='relative flex shrink-0 content-stretch items-start justify-start'>
            <div className='relative flex shrink-0 items-center justify-center'>
              <div className='flex-none scale-y-[-100%]'>
                <MessageTail variant='hospital' />
              </div>
            </div>
            <MessageBubble variant='hospital' className='self-stretch'>
              <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] whitespace-pre-wrap text-neutral-900 not-italic">
                {message.content}
              </div>
            </MessageBubble>
          </div>
          <MessageTime time={formattedTime} />
        </div>
      </div>
    );
  } else {
    // User 메시지 (k-doc의 UserMessage 스타일)
    return (
      <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
        <MessageTime time={formattedTime} />
        <div className='relative flex shrink-0 content-stretch items-end justify-end'>
          <div className='flex flex-row items-end self-stretch'>
            <MessageBubble variant='user' className='h-full items-end justify-start'>
              <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[14px] leading-[20px] whitespace-pre-wrap text-neutral-50 not-italic">
                {message.content}
              </div>
            </MessageBubble>
          </div>
          <MessageTail variant='user' />
        </div>
      </div>
    );
  }
}
