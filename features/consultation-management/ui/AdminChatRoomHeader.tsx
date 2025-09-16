'use client';

import { Badge } from '@/components/ui/badge';

interface AdminChatRoomHeaderProps {
  districtName?: string;
  lastMessageDate?: string;
  userDisplayName?: string;
}

export function AdminChatRoomHeader({
  districtName,
  lastMessageDate,
  userDisplayName,
}: AdminChatRoomHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className='text-muted-foreground flex items-center justify-between text-sm'>
      <div className='flex items-center gap-2'>
        {districtName && (
          <Badge variant='secondary' className='text-xs'>
            {districtName}
          </Badge>
        )}
        {userDisplayName && (
          <Badge variant='outline' className='text-xs'>
            {userDisplayName}
          </Badge>
        )}
      </div>
      <span className='text-xs'>{formatDate(lastMessageDate)}</span>
    </div>
  );
}
