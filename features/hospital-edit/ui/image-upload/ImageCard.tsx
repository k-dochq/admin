'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { type ImageCardProps } from './types';

export function ImageCard({ image, imageTypeLabel, isDeleting, onDelete }: ImageCardProps) {
  return (
    <div className='group relative'>
      <div className='relative aspect-square overflow-hidden rounded-lg border'>
        <Image
          src={image.imageUrl}
          alt={image.alt || `${imageTypeLabel} 이미지`}
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
    </div>
  );
}
