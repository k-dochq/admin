'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import {
  ALL_SHORT_LOCALES,
  SHORT_LOCALE_LABELS,
  SHORT_LOCALE_FLAGS,
  type ShortLocale,
} from '@/shared/lib/types/locale';
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
  locale: ShortLocale;
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
  locale: ShortLocale;
  error?: string;
}

const emptyFileInputRefs = (): Record<ShortLocale, HTMLInputElement | null> =>
  ALL_SHORT_LOCALES.reduce(
    (acc, locale) => ({ ...acc, [locale]: null }),
    {} as Record<ShortLocale, HTMLInputElement | null>,
  );

export function ThumbnailUploadSection({ videoId }: ThumbnailUploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [dragOverLocale, setDragOverLocale] = useState<ShortLocale | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRefs = useRef<Record<ShortLocale, HTMLInputElement | null>>(emptyFileInputRefs());

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
    (file: File, locale: ShortLocale): FileWithPreview => {
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
    (event: React.ChangeEvent<HTMLInputElement>, locale: ShortLocale) => {
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
  const handleDragOver = useCallback((event: React.DragEvent, locale: ShortLocale) => {
    event.preventDefault();
    setDragOverLocale(locale);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOverLocale(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, locale: ShortLocale) => {
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
  const removeSelectedFile = useCallback((locale: ShortLocale) => {
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
    async (locale: ShortLocale) => {
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
          언어별 썸네일을 업로드하세요. 카드 클릭 또는 드래그로 선택 가능 (최대 500KB, 언어당 1개)
        </p>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {ALL_SHORT_LOCALES.map((locale) => {
            const existingThumbnail = existingThumbnails.find(
              (t: YoutubeVideoThumbnail) => t.locale === locale,
            );
            const selectedFile = selectedFiles.find((f) => f.locale === locale);
            const isUploading = uploading && selectedFile?.locale === locale;

            return (
              <div
                key={locale}
                className='flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-muted-foreground/50'
              >
                {/* 언어 라벨 + 상태 */}
                <div className='flex min-h-0 shrink-0 items-center justify-between gap-1 border-b px-2 py-1.5'>
                  <span className='truncate text-sm font-medium'>
                    {SHORT_LOCALE_FLAGS[locale]} {SHORT_LOCALE_LABELS[locale]}
                  </span>
                  {existingThumbnail && (
                    <Badge variant='secondary' className='shrink-0 text-xs'>
                      업로드됨
                    </Badge>
                  )}
                </div>

                {/* 썸네일 또는 업로드 영역 */}
                <div className='relative flex-1 min-h-0'>
                  {existingThumbnail ? (
                    <div className='group relative aspect-video w-full overflow-hidden bg-muted'>
                      <Image
                        src={existingThumbnail.imageUrl}
                        alt={existingThumbnail.alt || `${SHORT_LOCALE_LABELS[locale]} thumbnail`}
                        fill
                        className='object-cover'
                      />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() =>
                            handleDelete(existingThumbnail.id, existingThumbnail.imageUrl)
                          }
                          disabled={deleteMutation.isPending}
                          className='shadow-md'
                        >
                          <Trash2 className='mr-1 h-3.5 w-3.5' />
                          삭제
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex h-full min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-b-md p-2 text-center transition-colors ${
                        dragOverLocale === locale
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, locale)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, locale)}
                      onClick={() => !selectedFile && fileInputRefs.current[locale]?.click()}
                    >
                      <input
                        ref={(el) => {
                          fileInputRefs.current[locale] = el;
                        }}
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleFileSelect(e, locale)}
                        className='hidden'
                      />
                      {selectedFile ? (
                        <div className='flex w-full flex-1 flex-col gap-1.5'>
                          <div className='relative aspect-video w-full overflow-hidden rounded border bg-muted'>
                            {selectedFile.error ? (
                              <div className='flex size-full items-center justify-center bg-red-50 p-1'>
                                <p className='text-destructive line-clamp-2 text-xs'>
                                  {selectedFile.error}
                                </p>
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
                          <div className='flex flex-wrap items-center justify-center gap-1'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-7 text-xs'
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedFile(locale);
                              }}
                              disabled={isUploading}
                            >
                              <X className='mr-1 h-3 w-3' />
                              취소
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              className='h-7 text-xs'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpload(locale);
                              }}
                              disabled={isUploading || !!selectedFile.error}
                            >
                              {isUploading ? (
                                <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                              ) : (
                                <Upload className='mr-1 h-3 w-3' />
                              )}
                              업로드
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className='text-muted-foreground mb-1 h-5 w-5' />
                          <p className='text-muted-foreground text-xs'>
                            클릭 또는 드래그
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
