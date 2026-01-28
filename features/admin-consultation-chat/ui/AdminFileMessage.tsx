'use client';

import { MessageTime } from '@/shared/ui/message-bubble';
import { FileMessage } from './FileMessage';
import { AdminMessageHeader } from './AdminMessageHeader';

interface AdminFileMessageProps {
  files: Array<{ url: string; fileName?: string; fileSize?: number; mimeType?: string }>;
  formattedTime: string;
  showHeader?: boolean;
  isRead?: boolean;
  adminName?: string;
}

export function AdminFileMessage({
  files,
  formattedTime,
  showHeader = true,
  isRead,
  adminName,
}: AdminFileMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
      <AdminMessageHeader showHeader={showHeader} adminName={adminName} />
      <div className='relative box-border flex w-full shrink-0 flex-col content-stretch items-start gap-1 py-0 pr-0 pl-[38px] sm:flex-row sm:items-end sm:justify-start sm:gap-2'>
        <div className='relative flex min-w-0 shrink-0 content-stretch items-start justify-start'>
          <FileMessage files={files} align='start' />
        </div>
        <div className='flex flex-col items-end gap-1'>
          <MessageTime time={formattedTime} />
          {isRead && <span className='text-xs text-blue-500'>읽음</span>}
        </div>
      </div>
    </div>
  );
}
