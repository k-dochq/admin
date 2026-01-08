'use client';

import { MessageTime } from '@/shared/ui/message-bubble';
import { FileMessage } from './FileMessage';

interface UserFileMessageProps {
  files: Array<{ url: string; fileName?: string; fileSize?: number; mimeType?: string }>;
  formattedTime: string;
}

export function UserFileMessage({ files, formattedTime }: UserFileMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
      <MessageTime time={formattedTime} />
      <div className='relative flex shrink-0 content-stretch items-end justify-end'>
        <FileMessage files={files} align='end' />
      </div>
    </div>
  );
}
