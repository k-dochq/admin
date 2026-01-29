'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { HOSPITAL_LOCALE_FLAGS, HOSPITAL_LOCALE_LABELS } from '@/shared/lib/types/locale';
import type { HospitalLocale } from '../LanguageTabs';
import type { MediaTabType } from './types';
import type { FileWithPreview } from './types';

export interface ExistingImageForLocale {
  id: string;
  imageUrl: string;
}

interface LocaleUploadCardProps {
  locale: HospitalLocale;
  tab: MediaTabType;
  files: FileWithPreview[];
  existingImages: ExistingImageForLocale[];
  isDragOver: boolean;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onRemoveFile: (fileId: string) => void;
  onDeleteExisting: (imageId: string) => void;
  onSelectClick: () => void;
  isDeleting: boolean;
}

export function LocaleUploadCard({
  locale,
  tab,
  files,
  existingImages,
  isDragOver,
  fileInputRef,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onDeleteExisting,
  onSelectClick,
  isDeleting,
}: LocaleUploadCardProps) {
  return (
    <div className='flex flex-col gap-2 rounded-lg border p-3 transition-colors'>
      <div className='flex items-center gap-1.5 text-sm font-medium'>
        <span>{HOSPITAL_LOCALE_FLAGS[locale]}</span>
        <span className='truncate'>{HOSPITAL_LOCALE_LABELS[locale]}</span>
      </div>

      {/* 업로드된 이미지 (해당 언어) */}
      {existingImages.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {existingImages.map((img) => (
            <div
              key={img.id}
              className='group relative aspect-square w-14 shrink-0 overflow-hidden rounded border'
            >
              <Image src={img.imageUrl} alt='' fill className='object-cover' sizes='56px' />
              <Button
                variant='destructive'
                size='sm'
                className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => onDeleteExisting(img.id)}
                disabled={isDeleting}
              >
                <Trash2 className='h-2.5 w-2.5' />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`flex min-h-[72px] flex-col items-center justify-center rounded-md border-2 border-dashed p-2 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Upload className='text-muted-foreground mb-0.5 h-4 w-4' />
        <p className='mb-1 text-[10px] font-medium'>드래그 또는 클릭</p>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={onFileSelect}
          className='hidden'
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-6 text-xs'
          onClick={onSelectClick}
        >
          <Plus className='mr-1 h-3 w-3' />
          선택
        </Button>
      </div>

      {files.length > 0 && (
        <div className='grid grid-cols-2 gap-1'>
          {files.map((file) => (
            <div key={file.id} className='group relative'>
              <div
                className={`relative aspect-square overflow-hidden rounded border ${
                  file.error ? 'border-destructive' : 'border-border'
                }`}
              >
                <img
                  src={file.preview}
                  alt={file.name || '미리보기'}
                  className='h-full w-full object-cover'
                />
              </div>
              <Button
                variant='destructive'
                size='sm'
                className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0'
                onClick={() => onRemoveFile(file.id)}
              >
                <X className='h-2 w-2' />
              </Button>
              {file.error && (
                <div className='bg-destructive/20 absolute inset-0 flex items-center justify-center rounded'>
                  <AlertCircle className='text-destructive h-3 w-3' />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
