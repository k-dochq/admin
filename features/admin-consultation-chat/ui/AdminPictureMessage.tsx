'use client';

import { MessageTime } from '@/shared/ui/message-bubble';
import { PictureMessage } from './PictureMessage';
import { AdminMessageHeader } from './AdminMessageHeader';

interface AdminPictureMessageProps {
  pictures: Array<{ url: string }>;
  formattedTime: string;
  showHeader?: boolean;
}

export function AdminPictureMessage({
  pictures,
  formattedTime,
  showHeader = true,
}: AdminPictureMessageProps) {
  return (
    <div className='relative flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-1'>
      <AdminMessageHeader showHeader={showHeader} />
      <div className='relative box-border flex w-full shrink-0 content-stretch items-end justify-start gap-2 py-0 pr-0 pl-[38px]'>
        <div className='relative flex min-w-0 shrink-0 content-stretch items-start justify-start'>
          <PictureMessage pictures={pictures} align='start' />
        </div>
        <MessageTime time={formattedTime} />
      </div>
    </div>
  );
}
