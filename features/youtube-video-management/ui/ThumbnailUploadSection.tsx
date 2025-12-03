'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import {
  useYoutubeVideoThumbnails,
  useCreateYoutubeVideoThumbnail,
  useDeleteYoutubeVideoThumbnail,
} from '@/lib/queries/youtube-videos';
import {
  uploadYoutubeVideoThumbnailClient,
  deleteYoutubeVideoThumbnailClient,
} from '@/shared/lib/supabase-client';

interface YoutubeVideoThumbnail {
  id: string;
  videoId: string;
  locale: 'ko' | 'en' | 'th';
  imageUrl: string;
  alt: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ThumbnailUploadSectionProps {
  videoId: string;
}

interface FileWithPreview extends File {
  preview: string;
  locale: 'ko' | 'en' | 'th';
  error?: string;
}

const LOCALES: Array<{ value: 'ko' | 'en' | 'th'; label: string; flag: string }> = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'th', label: 'ไทย', flag: '🇹🇭' },
];

export function ThumbnailUploadSection({ videoId }: ThumbnailUploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [dragOverLocale, setDragOverLocale] = useState<'ko' | 'en' | 'th' | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRefs = useRef<Record<'ko' | 'en' | 'th', HTMLInputElement | null>>({
    ko: null,
    en: null,
    th: null,
  });

  const { data: thumbnails, isLoading, error, refetch } = useYoutubeVideoThumbnails(videoId);
  const createMutation = useCreateYoutubeVideoThumbnail();
  const deleteMutation = useDeleteYoutubeVideoThumbnail();

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): string | null => {
    if (!file) {
      return '파일이 없습니다.';
    }

    if (!file.name) {
      return '파일 이름이 없습니다.';
    }

    if (file.size === 0) {
      return '파일 크기가 0입니다.';
    }

    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드할 수 있습니다.';
    }

    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return '파일 크기가 500KB를 초과합니다.';
    }

    return null;
  }, []);

  // 파일을 FileWithPreview로 변환
  const createFileWithPreview = useCallback(
    (file: File, locale: 'ko' | 'en' | 'th'): FileWithPreview => {
      const error = validateFile(file);

      const fileWithPreview = Object.assign(file, {
        locale,
        preview: URL.createObjectURL(file),
        error: error || undefined,
      }) as FileWithPreview;

      return fileWithPreview;
    },
    [validateFile],
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, locale: 'ko' | 'en' | 'th') => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const file = files[0];
      const fileWithPreview = createFileWithPreview(file, locale);

      // 기존 선택된 파일 중 같은 locale 제거
      setSelectedFiles((prev) => prev.filter((f) => f.locale !== locale));
      setSelectedFiles((prev) => [...prev, fileWithPreview]);

      // 파일 input 리셋
      event.target.value = '';
    },
    [createFileWithPreview],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((event: React.DragEvent, locale: 'ko' | 'en' | 'th') => {
    event.preventDefault();
    setDragOverLocale(locale);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOverLocale(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, locale: 'ko' | 'en' | 'th') => {
      event.preventDefault();
      setDragOverLocale(null);

      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const file = files[0];
      const fileWithPreview = createFileWithPreview(file, locale);

      // 기존 선택된 파일 중 같은 locale 제거
      setSelectedFiles((prev) => prev.filter((f) => f.locale !== locale));
      setSelectedFiles((prev) => [...prev, fileWithPreview]);
    },
    [createFileWithPreview],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback((locale: 'ko' | 'en' | 'th') => {
    setSelectedFiles((prev) =>
      prev.filter((file) => {
        if (file.locale === locale) {
          URL.revokeObjectURL(file.preview);
          return false;
        }
        return true;
      }),
    );
  }, []);

  // 업로드 핸들러
  const handleUpload = useCallback(
    async (locale: 'ko' | 'en' | 'th') => {
      const file = selectedFiles.find((f) => f.locale === locale && !f.error);
      if (!file) return;

      setUploading(true);

      try {
        // 1. Supabase Storage에 직접 업로드
        const uploadResult = await uploadYoutubeVideoThumbnailClient({
          file,
          videoId,
          locale,
        });

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || '업로드 실패');
        }

        // 2. 데이터베이스에 썸네일 정보 저장
        await createMutation.mutateAsync({
          videoId,
          data: {
            imageUrl: uploadResult.imageUrl!,
            locale,
            alt: null,
          },
        });

        // 성공 시 선택된 파일 정리
        URL.revokeObjectURL(file.preview);
        setSelectedFiles((prev) => prev.filter((f) => f.locale !== locale));

        // 썸네일 목록 새로고침
        refetch();
      } catch (error) {
        console.error('Upload failed:', error);
        alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading(false);
      }
    },
    [selectedFiles, videoId, createMutation, refetch],
  );

  // 기존 썸네일 삭제 핸들러
  const handleDelete = useCallback(
    async (thumbnailId: string, imageUrl: string) => {
      if (confirm('썸네일을 삭제하시겠습니까?')) {
        try {
          // 1. 데이터베이스에서 썸네일 정보 삭제
          await deleteMutation.mutateAsync({
            imageId: thumbnailId,
            videoId,
          });

          // 2. Supabase Storage에서 파일 삭제 (path 추출)
          // imageUrl에서 path 추출: https://...supabase.co/storage/v1/object/public/kdoc-storage/youtube-videos/.../...
          const urlParts = imageUrl.split('/kdoc-storage/');
          if (urlParts.length > 1) {
            const storagePath = `youtube-videos/${urlParts[1]}`;
            const deleteResult = await deleteYoutubeVideoThumbnailClient(storagePath);
            if (!deleteResult.success) {
              console.error('Storage delete failed:', deleteResult.error);
            }
          }

          // 3. 썸네일 목록 새로고침
          refetch();
        } catch (error) {
          console.error('Delete failed:', error);
          alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        }
      }
    },
    [videoId, deleteMutation, refetch],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>썸네일 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='썸네일을 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>썸네일 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>썸네일을 불러오는 중 오류가 발생했습니다.</div>
        </CardContent>
      </Card>
    );
  }

  const existingThumbnails = thumbnails || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>썸네일 이미지</CardTitle>
        <p className='text-muted-foreground text-sm'>
          언어별 썸네일 이미지를 업로드할 수 있습니다. (최대 500KB, 각 언어당 1개)
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {LOCALES.map((locale) => {
            const existingThumbnail = existingThumbnails.find(
              (t: YoutubeVideoThumbnail) => t.locale === locale.value,
            );
            const selectedFile = selectedFiles.find((f) => f.locale === locale.value);
            const isUploading = uploading && selectedFile?.locale === locale.value;

            return (
              <div key={locale.value} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-base font-medium'>
                    {locale.flag} {locale.label} 썸네일
                  </h3>
                  {existingThumbnail && <Badge variant='secondary'>업로드됨</Badge>}
                </div>

                {/* 기존 썸네일 또는 업로드 영역 */}
                {existingThumbnail ? (
                  <div className='relative aspect-video w-full max-w-md overflow-hidden rounded-lg border'>
                    <Image
                      src={existingThumbnail.imageUrl}
                      alt={existingThumbnail.alt || `${locale.label} thumbnail`}
                      fill
                      className='object-cover'
                    />
                    <div className='absolute top-2 right-2'>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() =>
                          handleDelete(existingThumbnail.id, existingThumbnail.imageUrl)
                        }
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                      dragOverLocale === locale.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, locale.value)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, locale.value)}
                  >
                    {selectedFile ? (
                      <div className='space-y-2'>
                        <div className='relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-lg border'>
                          {selectedFile.error ? (
                            <div className='flex h-full items-center justify-center bg-red-50'>
                              <div className='text-center'>
                                <AlertCircle className='text-destructive mx-auto mb-2 h-8 w-8' />
                                <p className='text-destructive text-sm'>{selectedFile.error}</p>
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={selectedFile.preview}
                              alt='Preview'
                              fill
                              className='object-cover'
                            />
                          )}
                        </div>
                        <div className='flex items-center justify-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeSelectedFile(locale.value)}
                            disabled={isUploading}
                          >
                            <X className='mr-2 h-4 w-4' />
                            취소
                          </Button>
                          <Button
                            type='button'
                            onClick={() => handleUpload(locale.value)}
                            disabled={isUploading || !!selectedFile.error}
                          >
                            {isUploading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            <Upload className='mr-2 h-4 w-4' />
                            업로드
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className='text-muted-foreground mx-auto mb-2 h-6 w-6' />
                        <p className='mb-1 text-sm font-medium'>
                          이미지를 드래그하거나 클릭하여 선택하세요
                        </p>
                        <p className='text-muted-foreground mb-2 text-xs'>
                          모든 이미지 형식 지원 (최대 500KB)
                        </p>

                        <input
                          ref={(el) => {
                            fileInputRefs.current[locale.value] = el;
                          }}
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleFileSelect(e, locale.value)}
                          className='hidden'
                        />

                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => fileInputRefs.current[locale.value]?.click()}
                        >
                          파일 선택
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
