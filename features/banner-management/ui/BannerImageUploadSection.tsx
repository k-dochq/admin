'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useBannerImages } from '@/lib/queries/banner-images';
import { useUploadBannerImage, useDeleteBannerImage } from '@/lib/mutations/banner-image-mutations';
import { type EventBannerLocale, type EventBannerImage } from '@prisma/client';
import {
  IMAGE_LOCALE_LABELS,
  IMAGE_LOCALE_FLAGS,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
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
  const [activeTab, setActiveTab] = useState<EventBannerLocale>('ko');
  const [selectedFiles, setSelectedFiles] = useState<Record<EventBannerLocale, FileWithPreview[]>>({
    ko: [],
    en: [],
    th: [],
  });
  const [dragOver, setDragOver] = useState<EventBannerLocale | null>(null);
  const [uploading, setUploading] = useState<Record<EventBannerLocale, boolean>>({
    ko: false,
    en: false,
    th: false,
  });

  const fileInputRefs = useRef<Record<EventBannerLocale, HTMLInputElement | null>>({
    ko: null,
    en: null,
    th: null,
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
        alert(`${IMAGE_LOCALE_LABELS[locale]} 이미지는 이미 업로드되어 있습니다.`);
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
        alert(`${IMAGE_LOCALE_LABELS[locale]} 이미지는 이미 업로드되어 있습니다.`);
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
    async (imageId: string) => {
      if (confirm('이미지를 삭제하시겠습니까?')) {
        try {
          await deleteMutation.mutateAsync({
            bannerId,
            imageId,
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EventBannerLocale)}>
          <TabsList className='grid w-full grid-cols-3'>
            {(['ko', 'en', 'th'] as const).map((locale) => {
              const existingImage = bannerImages?.find(
                (img: EventBannerImage) => img.locale === locale,
              );
              const selectedCount = selectedFiles[locale].length;

              return (
                <TabsTrigger key={locale} value={locale} className='text-xs'>
                  <div className='flex flex-col items-center'>
                    <span>
                      {IMAGE_LOCALE_FLAGS[locale]} {IMAGE_LOCALE_LABELS[locale]}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {existingImage ? '1' : '0'}/{selectedCount > 0 ? '1' : '0'}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(['ko', 'en', 'th'] as const).map((locale) => {
            const existingImage = bannerImages?.find(
              (img: EventBannerImage) => img.locale === locale,
            );
            const selectedFilesForLocale = selectedFiles[locale];
            const canUpload = !existingImage && selectedFilesForLocale.length === 0;
            const validFiles = selectedFilesForLocale.filter((file) => !file.error);

            return (
              <TabsContent key={locale} value={locale} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>
                    {IMAGE_LOCALE_FLAGS[locale]} {IMAGE_LOCALE_LABELS[locale]} 이미지
                  </h3>
                </div>

                {/* 기존 이미지 */}
                {existingImage && (
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>업로드된 이미지</h4>
                    <div className='relative h-20 w-32'>
                      <Image
                        src={existingImage.imageUrl}
                        alt={existingImage.alt || `${IMAGE_LOCALE_LABELS[locale]} 배너 이미지`}
                        fill
                        className='rounded-lg border object-cover'
                      />
                      <Button
                        variant='destructive'
                        size='sm'
                        className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                        onClick={() => handleDelete(existingImage.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 파일 업로드 영역 */}
                {!existingImage && (
                  <div
                    className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      dragOver === locale
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, locale)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, locale)}
                  >
                    <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                    <p className='mb-1 text-sm font-medium'>
                      이미지를 드래그하거나 클릭하여 선택하세요
                    </p>
                    <p className='text-muted-foreground mb-4 text-xs'>
                      JPEG, PNG, WEBP, GIF 지원 (최대 500KB)
                    </p>

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
                      onClick={() => fileInputRefs.current[locale]?.click()}
                      disabled={!canUpload}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      파일 선택
                    </Button>
                  </div>
                )}

                {/* 선택된 파일 미리보기 */}
                {selectedFilesForLocale.length > 0 && (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>선택된 파일</h4>
                      <Button
                        onClick={() => handleUpload(locale)}
                        disabled={validFiles.length === 0 || uploading[locale]}
                        size='sm'
                      >
                        {uploading[locale] ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            업로드 중...
                          </>
                        ) : (
                          `업로드 (${validFiles.length}장)`
                        )}
                      </Button>
                    </div>

                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                      {selectedFilesForLocale.map((file) => (
                        <div key={file.id} className='group relative'>
                          <div
                            className={`relative aspect-[335/140] overflow-hidden rounded-lg border ${
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
                            onClick={() => removeSelectedFile(locale, file.id)}
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

                          <div className='text-muted-foreground mt-1 truncate text-xs'>
                            {file.name}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                          {file.error && (
                            <div className='text-destructive mt-1 text-xs'>{file.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
