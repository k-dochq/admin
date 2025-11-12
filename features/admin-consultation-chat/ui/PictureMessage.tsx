'use client';

import { MessageImage } from '@/shared/ui/message-image';

interface PictureMessageProps {
  pictures: Array<{ url: string }>;
  align?: 'start' | 'end';
}

export function PictureMessage({ pictures, align = 'end' }: PictureMessageProps) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end' : 'items-start'}`}>
      {pictures.map((picture, index) => (
        <MessageImage key={`picture-${index}`} url={picture.url} />
      ))}
    </div>
  );
}
