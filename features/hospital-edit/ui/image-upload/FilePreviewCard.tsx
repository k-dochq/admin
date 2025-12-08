'use client';

import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { type FilePreviewCardProps } from './types';

export function FilePreviewCard({ file, onRemove }: FilePreviewCardProps) {
  return (
    <div className='group relative'>
      <div
        className={`relative aspect-square overflow-hidden rounded-lg border ${
          file.error ? 'border-destructive' : 'border-border'
        }`}
      >
        <img
          src={file.preview}
          alt={file.name || '업로드할 이미지 미리보기'}
          className='h-full w-full object-cover'
        />
      </div>

      <Button
        variant='destructive'
        size='sm'
        className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
        onClick={() => onRemove(file.id)}
      >
        <X className='h-3 w-3' />
      </Button>

      {file.error && (
        <div className='bg-destructive/20 absolute inset-0 flex items-center justify-center rounded-lg'>
          <div className='bg-destructive text-destructive-foreground flex items-center rounded p-1 text-xs'>
            <AlertCircle className='mr-1 h-3 w-3' />
            오류
          </div>
        </div>
      )}

      <div className='text-muted-foreground mt-1 truncate text-xs'>{file.name}</div>
      <div className='text-muted-foreground text-xs'>{(file.size / 1024).toFixed(1)} KB</div>
      {file.error && <div className='text-destructive mt-1 text-xs'>{file.error}</div>}
    </div>
  );
}
