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
    <div className='text-muted-foreground flex min-w-0 flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm'>
      <div className='flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:gap-2'>
        {districtName && (
          <Badge variant='secondary' className='flex-shrink-0 text-[10px] sm:text-xs'>
            {districtName}
          </Badge>
        )}
        {userDisplayName && (
          <Badge variant='outline' className='flex-shrink-0 text-[10px] sm:text-xs'>
            {userDisplayName}
          </Badge>
        )}
      </div>
      <span className='flex-shrink-0 text-[10px] sm:text-xs'>{formatDate(lastMessageDate)}</span>
    </div>
  );
}
