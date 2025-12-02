'use client';

import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IMAGE_LOCALE_LABELS, IMAGE_LOCALE_FLAGS } from '@/features/banner-management/api';
import { type EventBannerWithImages } from '@/features/banner-management/api';

interface BannerImagePreviewPopoverProps {
  banner: EventBannerWithImages;
}

export function BannerImagePreviewPopover({ banner }: BannerImagePreviewPopoverProps) {
  const imageCount = banner.bannerImages?.length || 0;

  if (imageCount === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <Eye className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto max-w-[90vw] p-4' align='start'>
        <div className='space-y-3'>
          <div className='text-sm font-medium'>배너 이미지</div>
          <div className='flex gap-4 overflow-x-auto pb-2'>
            {banner.bannerImages.map((image) => (
              <div key={image.id} className='flex flex-shrink-0 flex-col items-center space-y-2'>
                <div className='relative max-h-64'>
                  <img
                    src={image.imageUrl}
                    alt={image.alt || `${IMAGE_LOCALE_LABELS[image.locale]} 배너 이미지`}
                    className='max-h-64 w-auto rounded border object-contain'
                  />
                </div>
                <span className='text-muted-foreground text-center text-xs'>
                  {IMAGE_LOCALE_FLAGS[image.locale as keyof typeof IMAGE_LOCALE_FLAGS]}{' '}
                  {IMAGE_LOCALE_LABELS[image.locale as keyof typeof IMAGE_LOCALE_LABELS]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
