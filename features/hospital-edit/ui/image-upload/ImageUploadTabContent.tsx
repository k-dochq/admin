'use client';

import { forwardRef } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { IMAGE_TYPE_LABELS } from '../../api/entities/types';
import { type ImageUploadTabContentProps } from './types';
import { FileUploadDropzone } from './FileUploadDropzone';
import { SelectedFilesList } from './SelectedFilesList';
import { ExistingImagesList } from './ExistingImagesList';

export const ImageUploadTabContent = forwardRef<
  HTMLInputElement,
  Omit<ImageUploadTabContentProps, 'fileInputRef'>
>(
  (
    {
      imageType,
      existingImages,
      selectedFiles,
      limit,
      isDragOver,
      isUploading,
      onFileSelect,
      onDragOver,
      onDragLeave,
      onDrop,
      onFileInputClick,
      onRemoveSelectedFile,
      onUpload,
      onDeleteImage,
      isDeleting,
    },
    ref,
  ) => {
    const imageTypeLabel = IMAGE_TYPE_LABELS[imageType];
    const currentCount = existingImages.length + selectedFiles.length;
    const canUpload = currentCount < limit;
    const validFiles = selectedFiles.filter((file) => !file.error);

    return (
      <TabsContent value={imageType} className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>{imageTypeLabel}</h3>
          <div className='text-muted-foreground text-sm'>
            {currentCount}/{limit}장
          </div>
        </div>

        {/* 파일 업로드 영역 */}
        <FileUploadDropzone
          ref={ref}
          imageType={imageType}
          isDragOver={isDragOver}
          canUpload={canUpload}
          limit={limit}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileSelect={onFileSelect}
          onFileInputClick={onFileInputClick}
        />

        {/* 선택된 파일 미리보기 */}
        <SelectedFilesList
          files={selectedFiles}
          imageType={imageType}
          validFilesCount={validFiles.length}
          isUploading={isUploading}
          onRemove={onRemoveSelectedFile}
          onUpload={onUpload}
        />

        {/* 기존 이미지 목록 */}
        <ExistingImagesList
          images={existingImages}
          imageTypeLabel={imageTypeLabel}
          isDeleting={isDeleting}
          onDelete={onDeleteImage}
        />

        {existingImages.length === 0 && selectedFiles.length === 0 && (
          <div className='text-muted-foreground py-8 text-center'>
            아직 업로드된 {imageTypeLabel.toLowerCase()}가 없습니다.
          </div>
        )}
      </TabsContent>
    );
  },
);

ImageUploadTabContent.displayName = 'ImageUploadTabContent';
