'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ALL_LOCALES } from '@/shared/lib/types/locale';
import type { LocalizedText } from '@/shared/lib/types/locale';
import type { HospitalImage } from '../../api/entities/types';
import type { MediaTabType } from './types';

interface UploadedImagesGridProps {
  images: HospitalImage[];
  imageType: MediaTabType;
  tabLabel: string;
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
}

export function UploadedImagesGrid({
  images,
  imageType,
  tabLabel,
  onDelete,
  isDeleting,
}: UploadedImagesGridProps) {
  if (images.length === 0) return null;

  return (
    <div className='space-y-4'>
      <h4 className='text-sm font-medium'>업로드된 이미지</h4>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        {images.map((image: HospitalImage) => {
          const links = (image.localizedLinks as LocalizedText) || {};
          return (
            <div key={image.id} className='group relative'>
              <div className='relative aspect-square overflow-hidden rounded-lg border'>
                <Image
                  src={image.imageUrl}
                  alt={image.alt || `${tabLabel} 이미지`}
                  fill
                  className='object-cover'
                />
              </div>
              <Button
                variant='destructive'
                size='sm'
                className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => onDelete(image.id)}
                disabled={isDeleting}
              >
                <Trash2 className='h-3 w-3' />
              </Button>
              {ALL_LOCALES.some((locale) => links[locale]) && (
                <div className='absolute right-0 bottom-0 left-0 flex flex-wrap gap-0.5 bg-black/60 p-1 text-[10px] text-white'>
                  {ALL_LOCALES.map(
                    (locale) =>
                      links[locale] && (
                        <span key={locale}>{locale.slice(0, 2).toUpperCase()} </span>
                      ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
