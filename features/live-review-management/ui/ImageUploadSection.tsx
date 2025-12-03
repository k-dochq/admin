'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useLiveReviewImages, useDeleteLiveReviewImage } from '@/lib/queries/live-review-images';
import { uploadLiveReviewImageClient, deleteReviewImageClient } from '@/shared/lib/supabase-client';

interface LiveReviewImage {
  id: string;
  liveReviewId: string;
  imageUrl: string;
  alt: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ImageUploadSectionProps {
  liveReviewId: string;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

const MAX_IMAGES = 10;

export function ImageUploadSection({ liveReviewId }: ImageUploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: liveReviewImages, isLoading, error, refetch } = useLiveReviewImages(liveReviewId);
  const deleteMutation = useDeleteLiveReviewImage();

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
    (file: File): FileWithPreview => {
      const error = validateFile(file);

      const fileWithPreview = Object.assign(file, {
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        error: error || undefined,
      }) as FileWithPreview;

      return fileWithPreview;
    },
    [validateFile],
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const existingCount = liveReviewImages?.length || 0;
      const availableSlots = MAX_IMAGES - existingCount - selectedFiles.length;

      if (availableSlots <= 0) {
        alert(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => [...prev, ...filesToAdd]);

      // 파일 input 리셋
      event.target.value = '';
    },
    [selectedFiles, liveReviewImages, createFileWithPreview],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const existingCount = liveReviewImages?.length || 0;
      const availableSlots = MAX_IMAGES - existingCount - selectedFiles.length;

      if (availableSlots <= 0) {
        alert(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    },
    [selectedFiles, liveReviewImages, createFileWithPreview],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) =>
      prev.filter((file) => {
        if (file.id === fileId) {
          URL.revokeObjectURL(file.preview);
          return false;
        }
        return true;
      }),
    );
  }, []);

  // 업로드 핸들러
  const handleUpload = useCallback(async () => {
    const files = selectedFiles.filter((file) => !file.error);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        if (!file || !file.name || file.size === 0) {
          throw new Error('유효하지 않은 파일입니다.');
        }

        // 1. Supabase Storage에 직접 업로드
        const uploadResult = await uploadLiveReviewImageClient({
          file,
          liveReviewId,
        });

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || '업로드 실패');
        }

        // 2. 데이터베이스에 이미지 정보 저장
        const response = await fetch(`/api/admin/live-reviews/${liveReviewId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: uploadResult.imageUrl,
            path: uploadResult.path,
          }),
        });

        if (!response.ok) {
          // 업로드는 성공했지만 DB 저장 실패 시 스토리지에서 삭제
          if (uploadResult.path) {
            await deleteReviewImageClient(uploadResult.path);
          }
          throw new Error('데이터베이스 저장 실패');
        }

        return response.json();
      });

      await Promise.all(uploadPromises);

      // 성공 시 선택된 파일들 정리
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);

      // 이미지 목록 새로고침
      refetch();
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, liveReviewId, refetch]);

  // 기존 이미지 삭제 핸들러
  const handleDelete = useCallback(
    async (imageId: string) => {
      if (confirm('이미지를 삭제하시겠습니까?')) {
        try {
          // 1. 데이터베이스에서 이미지 정보 삭제
          const response = await fetch(`/api/admin/live-reviews/images/${imageId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('데이터베이스 삭제 실패');
          }

          const result = await response.json();

          // 2. Supabase Storage에서 파일 삭제
          if (result.storagePath) {
            const deleteResult = await deleteReviewImageClient(result.storagePath);
            if (!deleteResult.success) {
              console.error('Storage delete failed:', deleteResult.error);
            }
          }

          // 3. 이미지 목록 새로고침
          refetch();
        } catch (error) {
          console.error('Delete failed:', error);
          alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
        }
      }
    },
    [refetch],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>생생후기 이미지</CardTitle>
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
          <CardTitle>생생후기 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>이미지를 불러오는 중 오류가 발생했습니다.</div>
        </CardContent>
      </Card>
    );
  }

  const existingImages = liveReviewImages || [];
  const currentCount = existingImages.length + selectedFiles.length;
  const canUpload = currentCount < MAX_IMAGES;
  const validFiles = selectedFiles.filter((file) => !file.error);

  return (
    <Card>
      <CardHeader>
        <CardTitle>생생후기 이미지</CardTitle>
        <p className='text-muted-foreground text-sm'>
          생생후기 이미지를 업로드하고 관리할 수 있습니다. (최대 500KB, 모든 이미지 형식 지원)
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>이미지</h3>
            <div className='text-muted-foreground text-sm'>
              {currentCount}/{MAX_IMAGES}장
            </div>
          </div>

          {/* 파일 업로드 영역 */}
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
            <p className='mb-1 text-sm font-medium'>이미지를 드래그하거나 클릭하여 선택하세요</p>
            <p className='text-muted-foreground mb-4 text-xs'>모든 이미지 형식 지원 (최대 500KB)</p>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              multiple
              onChange={handleFileSelect}
              className='hidden'
            />

            <Button
              type='button'
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              disabled={!canUpload}
            >
              <Plus className='mr-2 h-4 w-4' />
              파일 선택
            </Button>

            {!canUpload && (
              <p className='text-destructive mt-2 text-xs'>
                최대 {MAX_IMAGES}장까지만 업로드할 수 있습니다.
              </p>
            )}
          </div>

          {/* 선택된 파일 미리보기 */}
          {selectedFiles.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-medium'>선택된 파일</h4>
                <Button
                  onClick={handleUpload}
                  disabled={validFiles.length === 0 || uploading}
                  size='sm'
                >
                  {uploading ? (
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
                {selectedFiles.map((file) => (
                  <div key={file.id} className='group relative'>
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
                      onClick={() => removeSelectedFile(file.id)}
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

          {/* 기존 이미지 목록 */}
          {existingImages.length > 0 && (
            <div className='space-y-4'>
              <h4 className='text-sm font-medium'>업로드된 이미지</h4>

              <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                {existingImages.map((image: LiveReviewImage) => (
                  <div key={image.id} className='group relative'>
                    <div className='relative aspect-square overflow-hidden rounded-lg border'>
                      <Image
                        src={image.imageUrl}
                        alt={image.alt || '생생후기 이미지'}
                        fill
                        className='object-cover'
                      />
                    </div>

                    <Button
                      variant='destructive'
                      size='sm'
                      className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100'
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && selectedFiles.length === 0 && (
            <div className='text-muted-foreground py-8 text-center'>
              아직 업로드된 이미지가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
