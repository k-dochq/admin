'use client';

import { Badge } from '@/components/ui/badge';
import { type AdminChatMessage } from '@/lib/types/admin-chat';

interface AdminMessageBubbleProps {
  message: AdminChatMessage;
  isFromAdmin: boolean;
}

export function AdminMessageBubble({ message, isFromAdmin }: AdminMessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isFromAdmin ? 'order-2' : 'order-1'}`}>
        {/* 발신자 정보 */}
        <div
          className={`mb-1 flex items-center gap-2 ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
        >
          <Badge variant={isFromAdmin ? 'default' : 'secondary'} className='text-xs'>
            {isFromAdmin ? '관리자' : '사용자'}
          </Badge>
          <span className='text-muted-foreground text-xs'>{formatTime(message.timestamp)}</span>
        </div>

        {/* 메시지 내용 */}
        <div
          className={`rounded-lg px-3 py-2 ${
            isFromAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          }`}
        >
          <p className='text-sm break-words whitespace-pre-wrap'>{message.content}</p>
        </div>
      </div>
    </div>
  );
}
