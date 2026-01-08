'use client';

import { MessageTime } from '@/shared/ui/message-bubble';
import { PictureMessage } from './PictureMessage';

interface UserPictureMessageProps {
  pictures: Array<{ url: string }>;
  formattedTime: string;
}

export function UserPictureMessage({ pictures, formattedTime }: UserPictureMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 content-stretch items-end justify-end gap-2'>
      <MessageTime time={formattedTime} />
      <div className='relative flex shrink-0 content-stretch items-end justify-end'>
        <PictureMessage pictures={pictures} align='end' />
      </div>
    </div>
  );
}
