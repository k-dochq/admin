'use client';

import { MessageTime } from '@/shared/ui/message-bubble';
import { FileMessage } from './FileMessage';

interface UserFileMessageProps {
  files: Array<{ url: string; fileName?: string; fileSize?: number; mimeType?: string }>;
  formattedTime: string;
}

export function UserFileMessage({ files, formattedTime }: UserFileMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-end gap-1 sm:flex-row sm:items-end sm:justify-end sm:gap-2'>
      <div className='relative flex shrink-0 content-stretch items-end justify-end'>
        <FileMessage files={files} align='end' />
      </div>
      <MessageTime time={formattedTime} />
    </div>
  );
}
