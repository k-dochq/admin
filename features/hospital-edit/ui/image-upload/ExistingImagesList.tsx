'use client';

import { type ExistingImagesListProps } from './types';
import { ImageCard } from './ImageCard';

export function ExistingImagesList({
  images,
  imageTypeLabel,
  isDeleting,
  onDelete,
}: ExistingImagesListProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <h4 className='text-sm font-medium'>업로드된 이미지</h4>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            imageTypeLabel={imageTypeLabel}
            isDeleting={isDeleting}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
