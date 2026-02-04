'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ALL_LOCALES, HOSPITAL_LOCALE_LABELS } from '@/shared/lib/types/locale';
import type { LocalizedText } from '@/shared/lib/types/locale';
import type { HospitalImage } from '../../api/entities/types';

interface SavedVideoLinksListProps {
  images: HospitalImage[];
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
}

export function SavedVideoLinksList({
  images,
  onDelete,
  isDeleting,
}: SavedVideoLinksListProps) {
  if (images.length === 0) return null;

  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>저장된 영상 링크</h4>
      <div className='space-y-2'>
        {images.map((image) => {
          const links = (image.localizedLinks as LocalizedText) || {};
          const titles = (image.title as LocalizedText) || {};
          return (
            <div key={image.id} className='space-y-2 rounded-lg border p-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>영상 링크</span>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => onDelete(image.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
              {ALL_LOCALES.map(
                (locale) =>
                  (links[locale] || titles[locale]) && (
                    <div key={locale} className='space-y-0.5 text-xs'>
                      <span className='text-muted-foreground'>
                        {HOSPITAL_LOCALE_LABELS[locale]}:
                      </span>
                      {titles[locale] && (
                        <div className='font-medium'>{titles[locale]}</div>
                      )}
                      {links[locale] && (
                        <a
                          href={links[locale]}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:underline'
                        >
                          {links[locale]}
                        </a>
                      )}
                    </div>
                  ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
