'use client';

import { DEFAULT_IMAGES } from '@/lib/config/images';

interface AdminChatRoomThumbnailProps {
  thumbnailUrl?: string;
  hospitalName: string;
}

export function AdminChatRoomThumbnail({
  thumbnailUrl,
  hospitalName,
}: AdminChatRoomThumbnailProps) {
  return (
    <div className='h-[80px] w-[80px] flex-shrink-0'>
      <div className='relative h-full w-full overflow-hidden rounded-lg'>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={hospitalName}
            className='h-full w-full object-cover'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_IMAGES.HOSPITAL_DEFAULT;
            }}
          />
        ) : (
          <img
            src={DEFAULT_IMAGES.HOSPITAL_DEFAULT}
            alt={hospitalName}
            className='h-full w-full object-cover'
          />
        )}
      </div>
    </div>
  );
}
