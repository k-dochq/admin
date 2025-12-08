'use client';

import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import { type FileUploadDropzoneProps } from './types';

export const FileUploadDropzone = forwardRef<
  HTMLInputElement,
  Omit<FileUploadDropzoneProps, 'fileInputRef'>
>(
  (
    {
      isDragOver,
      canUpload,
      limit,
      onDragOver,
      onDragLeave,
      onDrop,
      onFileSelect,
      onFileInputClick,
    },
    ref,
  ) => {
    return (
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
        <p className='mb-1 text-sm font-medium'>이미지를 드래그하거나 클릭하여 선택하세요</p>
        <p className='text-muted-foreground mb-4 text-xs'>모든 이미지 형식 지원 (최대 500KB)</p>

        <input
          ref={ref}
          type='file'
          accept='image/*'
          multiple
          onChange={onFileSelect}
          className='hidden'
        />

        <Button type='button' variant='outline' onClick={onFileInputClick} disabled={!canUpload}>
          <Plus className='mr-2 h-4 w-4' />
          파일 선택
        </Button>

        {!canUpload && (
          <p className='text-destructive mt-2 text-xs'>
            최대 {limit}장까지만 업로드할 수 있습니다.
          </p>
        )}
      </div>
    );
  },
);

FileUploadDropzone.displayName = 'FileUploadDropzone';
