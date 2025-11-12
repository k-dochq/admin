'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MessageImageProps {
  url: string;
  alt?: string;
}

export function MessageImage({ url, alt = 'Uploaded image' }: MessageImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (hasError) {
    return (
      <div className='flex h-[200px] w-full max-w-[280px] items-center justify-center rounded-xl'>
        <p className='text-sm text-gray-500'>이미지를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <button
        type='button'
        onClick={handleImageClick}
        className='relative w-full max-w-[280px] cursor-pointer overflow-hidden rounded-xl'
        aria-label='이미지 확대보기'
      >
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#DA47EF]' />
          </div>
        )}
        <Image
          src={url}
          alt={alt}
          width={280}
          height={280}
          className='h-auto w-full rounded-xl object-cover'
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          unoptimized
        />
      </button>

      {/* 이미지 모달 */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className='max-h-[90vh] max-w-[90vw] border-none bg-black/90 p-0'>
          <div className='relative flex h-full min-h-[50vh] w-full items-center justify-center'>
            <button
              onClick={handleCloseModal}
              className='absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30'
              aria-label='닫기'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='18' y1='6' x2='6' y2='18'></line>
                <line x1='6' y1='6' x2='18' y2='18'></line>
              </svg>
            </button>
            <img src={url} alt={alt} className='max-h-[90vh] max-w-full object-contain' />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
