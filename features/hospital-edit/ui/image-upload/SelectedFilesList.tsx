'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { type SelectedFilesListProps } from './types';
import { FilePreviewCard } from './FilePreviewCard';

export function SelectedFilesList({
  files,
  imageType,
  validFilesCount,
  isUploading,
  onRemove,
  onUpload,
}: SelectedFilesListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='text-sm font-medium'>선택된 파일</h4>
        <Button onClick={onUpload} disabled={validFilesCount === 0 || isUploading} size='sm'>
          {isUploading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              업로드 중...
            </>
          ) : (
            `업로드 (${validFilesCount}장)`
          )}
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {files.map((file) => (
          <FilePreviewCard key={file.id} file={file} imageType={imageType} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
