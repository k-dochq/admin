'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { ALL_LOCALES } from '@/shared/lib/types/locale';
import type { LocalizedText } from '@/shared/lib/types/locale';
import type { HospitalLocale } from '../LanguageTabs';
import type { HospitalImage } from '../../api/entities/types';
import type { HospitalImageType } from '../../api/entities/types';
import { LocaleUploadCard, type ExistingImageForLocale } from './LocaleUploadCard';
import type { MediaTabType } from './types';
import type { FileWithPreview } from './types';

interface ImageUploadTabProps {
  tab: MediaTabType;
  selectedFiles: Record<HospitalLocale, FileWithPreview[]>;
  dragOver: { tab: MediaTabType; locale: HospitalLocale } | null;
  uploading: Record<HospitalLocale, boolean>;
  hospitalImages: HospitalImage[] | undefined;
  fileInputRef: (
    tab: MediaTabType,
    locale: HospitalLocale,
  ) => (el: HTMLInputElement | null) => void;
  onFileSelect: (
    tab: MediaTabType,
    locale: HospitalLocale,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (tab: MediaTabType, locale: HospitalLocale) => (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (tab: MediaTabType, locale: HospitalLocale) => (e: React.DragEvent) => void;
  onRemoveFile: (tab: MediaTabType, locale: HospitalLocale, fileId: string) => void;
  onSelectClick: (tab: MediaTabType, locale: HospitalLocale) => () => void;
  onUpload: (tab: MediaTabType) => void;
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
}

export function ImageUploadTab({
  tab,
  selectedFiles,
  dragOver,
  uploading,
  hospitalImages,
  fileInputRef,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onSelectClick,
  onUpload,
  onDelete,
  isDeleting,
}: ImageUploadTabProps) {
  const imageType = tab as HospitalImageType;
  const activeImages =
    hospitalImages?.filter((img) => img.imageType === imageType && img.isActive) ?? [];

  /**
   * k-doc와 동일한 바인딩: localizedLinks[locale]가 있으면 사용, 없으면 alt === locale일 때 imageUrl 사용
   */
  const getExistingImagesForLocale = (locale: HospitalLocale): ExistingImageForLocale[] =>
    activeImages
      .filter((img) => {
        const links = (img.localizedLinks as LocalizedText) || {};
        if (links[locale]) return true;
        if (img.alt === locale && img.imageUrl?.trim()) return true;
        return false;
      })
      .map((img) => {
        const links = (img.localizedLinks as LocalizedText) || {};
        const url = links[locale] || img.imageUrl || '';
        return { id: img.id, imageUrl: url };
      });

  const hasValidFiles = ALL_LOCALES.some(
    (locale) => selectedFiles[locale].filter((f) => !f.error).length > 0,
  );
  const isUploading = Object.values(uploading).some(Boolean);

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground text-sm'>
        각 언어별로 이미지를 선택한 후, 하단의 업로드 버튼을 클릭하면 모든 언어의 이미지를 한 번에
        저장합니다.
      </p>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {ALL_LOCALES.map((locale) => (
          <LocaleUploadCard
            key={locale}
            locale={locale}
            tab={tab}
            files={selectedFiles[locale]}
            existingImages={getExistingImagesForLocale(locale)}
            isDragOver={dragOver?.tab === tab && dragOver?.locale === locale}
            fileInputRef={fileInputRef(tab, locale)}
            onFileSelect={onFileSelect(tab, locale)}
            onDragOver={onDragOver(tab, locale)}
            onDragLeave={onDragLeave}
            onDrop={onDrop(tab, locale)}
            onRemoveFile={(fileId) => onRemoveFile(tab, locale, fileId)}
            onDeleteExisting={onDelete}
            onSelectClick={onSelectClick(tab, locale)}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      {hasValidFiles && (
        <div className='pt-4'>
          <Button
            onClick={() => onUpload(tab)}
            disabled={!hasValidFiles || isUploading}
            className='w-full'
          >
            {isUploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                모든 언어 이미지 업로드
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
