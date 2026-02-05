'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useBannerImages } from '@/lib/queries/banner-images';
import { useUploadBannerImage, useDeleteBannerImage } from '@/lib/mutations/banner-image-mutations';
import {
  type EventBannerLocale,
  type EventBannerImage,
  IMAGE_LOCALE_LABELS,
  IMAGE_LOCALE_FLAGS,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  VALID_EVENT_BANNER_LOCALES,
} from '@/features/banner-management/api';

interface BannerImageUploadSectionProps {
  bannerId: string;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

export function BannerImageUploadSection({ bannerId }: BannerImageUploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<EventBannerLocale, FileWithPreview[]>>({
    ko: [],
    en: [],
    th: [],
    zh: [],
    ja: [],
    hi: [],
    tl: [],
    ar: [],
    ru: [],
  });
  const [dragOver, setDragOver] = useState<EventBannerLocale | null>(null);
  const [uploading, setUploading] = useState<Record<EventBannerLocale, boolean>>({
    ko: false,
    en: false,
    th: false,
    zh: false,
    ja: false,
    hi: false,
    tl: false,
    ar: false,
    ru: false,
  });

  const fileInputRefs = useRef<Record<EventBannerLocale, HTMLInputElement | null>>({
    ko: null,
    en: null,
    th: null,
    zh: null,
    ja: null,
    hi: null,
    tl: null,
    ar: null,
    ru: null,
  });

  const { data: bannerImages, isLoading, error, refetch } = useBannerImages(bannerId);
  const uploadMutation = useUploadBannerImage();
  const deleteMutation = useDeleteBannerImage();

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): string | null => {
    if (!file || !file.name || file.size === 0) {
      return '유효하지 않은 파일입니다.';
    }

    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드할 수 있습니다.';
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return '지원하지 않는 이미지 형식입니다.';
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return '파일 크기가 500KB를 초과합니다.';
    }

    return null;
  }, []);

  // 파일을 FileWithPreview로 변환
  const createFileWithPreview = useCallback(
    (file: File): FileWithPreview => {
      const error = validateFile(file);

      return Object.assign(file, {
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        error: error || undefined,
      }) as FileWithPreview;
    },
    [validateFile],
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, locale: EventBannerLocale) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const currentFiles = selectedFiles[locale];
      const existingImage = bannerImages?.find((img: EventBannerImage) => img.locale === locale);

      if (existingImage && currentFiles.length === 0) {
        const localeLabel = IMAGE_LOCALE_LABELS[locale];
        alert(`${localeLabel} 이미지는 이미 업로드되어 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, 1).map(createFileWithPreview); // 언어당 1개만

      setSelectedFiles((prev) => ({
        ...prev,
        [locale]: [...prev[locale], ...filesToAdd],
      }));

      event.target.value = '';
    },
    [selectedFiles, bannerImages, createFileWithPreview],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((event: React.DragEvent, locale: EventBannerLocale) => {
    event.preventDefault();
    setDragOver(locale);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, locale: EventBannerLocale) => {
      event.preventDefault();
      setDragOver(null);

      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const currentFiles = selectedFiles[locale];
      const existingImage = bannerImages?.find((img: EventBannerImage) => img.locale === locale);

      if (existingImage && currentFiles.length === 0) {
        const localeLabel = IMAGE_LOCALE_LABELS[locale];
        alert(`${localeLabel} 이미지는 이미 업로드되어 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, 1).map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [locale]: [...prev[locale], ...filesToAdd],
      }));
    },
    [selectedFiles, bannerImages, createFileWithPreview],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback((locale: EventBannerLocale, fileId: string) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [locale]: prev[locale].filter((file) => {
        if (file.id === fileId) {
          URL.revokeObjectURL(file.preview);
          return false;
        }
        return true;
      }),
    }));
  }, []);

  // 업로드 핸들러
  const handleUpload = useCallback(
    async (locale: EventBannerLocale) => {
      const files = selectedFiles[locale].filter((file) => !file.error);
      if (files.length === 0) return;

      setUploading((prev) => ({ ...prev, [locale]: true }));

      try {
        const file = files[0]; // 첫 번째 파일만 업로드
        await uploadMutation.mutateAsync({
          bannerId,
          locale,
          file,
        });

        // 성공 시 선택된 파일들 정리
        selectedFiles[locale].forEach((file) => URL.revokeObjectURL(file.preview));
        setSelectedFiles((prev) => ({
          ...prev,
          [locale]: [],
        }));

        refetch();
      } catch (error) {
        console.error('Upload failed:', error);
        alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading((prev) => ({ ...prev, [locale]: false }));
      }
    },
    [selectedFiles, bannerId, uploadMutation, refetch],
  );

  // 기존 이미지 삭제 핸들러
  const handleDelete = useCallback(
    async (imageId: string, imageUrl: string) => {
      if (confirm('이미지를 삭제하시겠습니까?')) {
        try {
          // imageUrl에서 storage path 추출
          const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/kdoc-storage\/(.+)/);
          if (!pathMatch) {
            throw new Error('Invalid image URL');
          }
          const storagePath = pathMatch[1];

          await deleteMutation.mutateAsync({
            bannerId,
            imageId,
            storagePath,
          });

          refetch();
        } catch (error) {
          console.error('Delete failed:', error);
          alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        }
      }
    },
    [bannerId, deleteMutation, refetch],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>배너 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='이미지를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>배너 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>이미지를 불러오는 중 오류가 발생했습니다.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>배너 이미지</CardTitle>
        <p className='text-muted-foreground text-sm'>
          각 언어별로 배너 이미지를 업로드할 수 있습니다. (최대 500KB, JPEG/PNG/WEBP/GIF 지원)
        </p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {VALID_EVENT_BANNER_LOCALES.map((locale) => {
            const existingImage = bannerImages?.find(
              (img: EventBannerImage) => img.locale === locale,
            );
            const selectedFilesForLocale = selectedFiles[locale];
            const canUpload = !existingImage && selectedFilesForLocale.length === 0;
            const validFiles = selectedFilesForLocale.filter((file) => !file.error);

            return (
              <div
                key={locale}
                className='flex flex-col gap-2 rounded-lg border p-3 transition-colors'
              >
                <div className='flex items-center justify-between gap-1'>
                  <div className='flex min-w-0 items-center gap-1.5 text-sm font-medium'>
                    <span>{IMAGE_LOCALE_FLAGS[locale]}</span>
                    <span className='truncate'>{IMAGE_LOCALE_LABELS[locale]}</span>
                  </div>
                  <Badge variant='secondary' className='shrink-0 text-xs'>
                    {existingImage ? '1' : '0'}/{selectedFilesForLocale.length > 0 ? '1' : '0'}
                  </Badge>
                </div>

                {/* 기존 이미지 */}
                {existingImage && (
                  <div className='relative'>
                    <img
                      src={existingImage.imageUrl}
                      alt={existingImage.alt || `${IMAGE_LOCALE_LABELS[locale]} 배너 이미지`}
                      className='aspect-[2/1] w-full rounded-md border object-cover'
                    />
                    <Button
                      variant='destructive'
                      size='sm'
                      className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0'
                      onClick={() => handleDelete(existingImage.id, existingImage.imageUrl)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className='h-2.5 w-2.5' />
                    </Button>
                  </div>
                )}

                {/* 파일 업로드 영역 */}
                {!existingImage && (
                  <div
                    className={`flex min-h-[72px] flex-col items-center justify-center rounded-md border-2 border-dashed p-2 text-center transition-colors ${
                      dragOver === locale
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, locale)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, locale)}
                  >
                    <Upload className='text-muted-foreground mb-0.5 h-4 w-4' />
                    <p className='mb-1 text-[10px] font-medium'>드래그 또는 클릭</p>
                    <input
                      ref={(el) => {
                        if (fileInputRefs.current) {
                          fileInputRefs.current[locale] = el;
                        }
                      }}
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleFileSelect(e, locale)}
                      className='hidden'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='h-6 text-xs'
                      onClick={() => fileInputRefs.current[locale]?.click()}
                      disabled={!canUpload}
                    >
                      <Plus className='mr-1 h-3 w-3' />
                      선택
                    </Button>
                  </div>
                )}

                {/* 선택된 파일 미리보기 */}
                {selectedFilesForLocale.length > 0 && (
                  <>
                    <div className='relative aspect-[2/1] overflow-hidden rounded-md border'>
                      <img
                        src={selectedFilesForLocale[0].preview}
                        alt={selectedFilesForLocale[0].name || '미리보기'}
                        className='h-full w-full object-cover'
                      />
                      <Button
                        variant='destructive'
                        size='sm'
                        className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0'
                        onClick={() => removeSelectedFile(locale, selectedFilesForLocale[0].id)}
                      >
                        <X className='h-2 w-2' />
                      </Button>
                      {selectedFilesForLocale[0].error && (
                        <div className='bg-destructive/20 absolute inset-0 flex items-center justify-center rounded'>
                          <AlertCircle className='text-destructive h-4 w-4' />
                        </div>
                      )}
                    </div>
                    <Button
                      size='sm'
                      className='h-7 w-full text-xs'
                      onClick={() => handleUpload(locale)}
                      disabled={validFiles.length === 0 || uploading[locale]}
                    >
                      {uploading[locale] ? <Loader2 className='h-3 w-3 animate-spin' /> : '업로드'}
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
