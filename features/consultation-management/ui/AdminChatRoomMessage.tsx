'use client';

import { Badge } from '@/components/ui/badge';
import { type SenderType } from '@/lib/types/consultation';

interface AdminChatRoomMessageProps {
  lastMessageContent?: string;
  lastMessageSenderType?: SenderType;
  unreadCount?: number;
}

export function AdminChatRoomMessage({
  lastMessageContent,
  lastMessageSenderType,
}: AdminChatRoomMessageProps) {
  const getSenderLabel = (senderType?: SenderType) => {
    switch (senderType) {
      case 'USER':
        return '사용자';
      case 'ADMIN':
        return '관리자';
      default:
        return '';
    }
  };

  return (
    <div className='flex items-center justify-between'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        {lastMessageSenderType && (
          <Badge
            variant={lastMessageSenderType === 'ADMIN' ? 'default' : 'secondary'}
            className='flex-shrink-0 text-xs'
          >
            {getSenderLabel(lastMessageSenderType)}
          </Badge>
        )}
        <p className='text-muted-foreground truncate text-sm'>
          {lastMessageContent || '메시지 없음'}
        </p>
      </div>
    </div>
  );
}
