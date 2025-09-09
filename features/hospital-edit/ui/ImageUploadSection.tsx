'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, Plus, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalImages, useDeleteHospitalImage } from '@/lib/queries/hospital-images';
import { uploadHospitalImageClient, deleteHospitalImageClient } from '@/shared/lib/supabase-client';
import {
  type HospitalImageType,
  type HospitalImage,
  IMAGE_TYPE_LIMITS,
  IMAGE_TYPE_LABELS,
} from '../api/entities/types';

interface ImageUploadSectionProps {
  hospitalId: string;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

export function ImageUploadSection({ hospitalId }: ImageUploadSectionProps) {
  const [activeTab, setActiveTab] = useState<HospitalImageType>('MAIN');
  const [selectedFiles, setSelectedFiles] = useState<Record<HospitalImageType, FileWithPreview[]>>({
    MAIN: [],
    THUMBNAIL: [],
    PROMOTION: [],
    DETAIL: [],
    INTERIOR: [],
  });
  const [dragOver, setDragOver] = useState<HospitalImageType | null>(null);
  const [uploading, setUploading] = useState<Record<HospitalImageType, boolean>>({
    MAIN: false,
    THUMBNAIL: false,
    PROMOTION: false,
    DETAIL: false,
    INTERIOR: false,
  });

  const fileInputRefs = useRef<Record<HospitalImageType, HTMLInputElement | null>>({
    MAIN: null,
    THUMBNAIL: null,
    PROMOTION: null,
    DETAIL: null,
    INTERIOR: null,
  });

  const { data: hospitalImages, isLoading, error, refetch } = useHospitalImages(hospitalId);
  const deleteMutation = useDeleteHospitalImage();

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): string | null => {
    console.log('file', file);
    console.log('file.name:', file.name);
    console.log('file.size:', file.size);
    console.log('file.type:', file.type);

    // 파일 존재 체크
    if (!file) {
      console.log('파일이 없습니다');
      return '파일이 없습니다.';
    }

    // 파일 이름 체크
    if (!file.name) {
      console.log('파일 이름이 없습니다');
      return '파일 이름이 없습니다.';
    }

    // 파일 크기 체크 (0바이트)
    if (file.size === 0) {
      console.log('파일 크기가 0입니다');
      return '파일 크기가 0입니다.';
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      console.log('이미지 파일이 아닙니다:', file.type);
      return '이미지 파일만 업로드할 수 있습니다.';
    }

    // 파일 크기 체크 (500KB)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      console.log('파일 크기 초과:', file.size, 'bytes');
      return '파일 크기가 500KB를 초과합니다.';
    }

    console.log('파일 검증 통과');
    return null;
  }, []);

  // 파일을 FileWithPreview로 변환
  const createFileWithPreview = useCallback(
    (file: File): FileWithPreview => {
      console.log('createFileWithPreview 호출됨, file:', file);
      const error = validateFile(file);
      console.log('validateFile 결과:', error);

      // File 객체의 속성을 명시적으로 복사
      const fileWithPreview = Object.assign(file, {
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        error: error || undefined,
      }) as FileWithPreview;

      console.log('생성된 FileWithPreview:', fileWithPreview);
      return fileWithPreview;
    },
    [validateFile],
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, imageType: HospitalImageType) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const currentFiles = selectedFiles[imageType];
      const limit = IMAGE_TYPE_LIMITS[imageType];
      const existingCount = (hospitalImages?.filter((img) => img.imageType === imageType) || [])
        .length;
      const availableSlots = limit - existingCount - currentFiles.length;

      if (availableSlots <= 0) {
        alert(`${IMAGE_TYPE_LABELS[imageType]}는 최대 ${limit}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [imageType]: [...prev[imageType], ...filesToAdd],
      }));

      // 파일 input 리셋
      event.target.value = '';
    },
    [selectedFiles, hospitalImages, createFileWithPreview],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((event: React.DragEvent, imageType: HospitalImageType) => {
    event.preventDefault();
    setDragOver(imageType);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, imageType: HospitalImageType) => {
      event.preventDefault();
      setDragOver(null);

      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const currentFiles = selectedFiles[imageType];
      const limit = IMAGE_TYPE_LIMITS[imageType];
      const existingCount = (hospitalImages?.filter((img) => img.imageType === imageType) || [])
        .length;
      const availableSlots = limit - existingCount - currentFiles.length;

      if (availableSlots <= 0) {
        alert(`${IMAGE_TYPE_LABELS[imageType]}는 최대 ${limit}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [imageType]: [...prev[imageType], ...filesToAdd],
      }));
    },
    [selectedFiles, hospitalImages, createFileWithPreview],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback((imageType: HospitalImageType, fileId: string) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [imageType]: prev[imageType].filter((file) => {
        if (file.id === fileId) {
          URL.revokeObjectURL(file.preview);
          return false;
        }
        return true;
      }),
    }));
  }, []);

  // 업로드 핸들러 (클라이언트 사이드)
  const handleUpload = useCallback(
    async (imageType: HospitalImageType) => {
      const files = selectedFiles[imageType].filter((file) => !file.error);
      if (files.length === 0) return;

      setUploading((prev) => ({ ...prev, [imageType]: true }));

      try {
        const uploadPromises = files.map(async (file) => {
          console.log('업로드할 파일:', file);
          console.log('file.name:', file.name);
          console.log('file.size:', file.size);
          console.log('typeof file.name:', typeof file.name);
          console.log('typeof file.size:', typeof file.size);

          // 파일 유효성 재검사
          if (!file || !file.name || file.size === 0) {
            console.log('업로드 파일 검증 실패');
            throw new Error('유효하지 않은 파일입니다.');
          }

          console.log('업로드 파일 검증 통과');

          // 1. Supabase Storage에 직접 업로드
          const uploadResult = await uploadHospitalImageClient({
            file,
            hospitalId,
            imageType,
          });

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || '업로드 실패');
          }

          // 2. 데이터베이스에 이미지 정보 저장
          const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageType,
              imageUrl: uploadResult.imageUrl,
              path: uploadResult.path,
            }),
          });

          if (!response.ok) {
            // 업로드는 성공했지만 DB 저장 실패 시 스토리지에서 삭제
            if (uploadResult.path) {
              await deleteHospitalImageClient(uploadResult.path);
            }
            throw new Error('데이터베이스 저장 실패');
          }

          return response.json();
        });

        await Promise.all(uploadPromises);

        // 성공 시 선택된 파일들 정리
        selectedFiles[imageType].forEach((file) => URL.revokeObjectURL(file.preview));
        setSelectedFiles((prev) => ({
          ...prev,
          [imageType]: [],
        }));

        // 이미지 목록 새로고침
        refetch();
      } catch (error) {
        console.error('Upload failed:', error);
        alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading((prev) => ({ ...prev, [imageType]: false }));
      }
    },
    [selectedFiles, hospitalId, refetch],
  );

  // 기존 이미지 삭제 핸들러 (클라이언트 사이드)
  const handleDelete = useCallback(
    async (imageId: string) => {
      if (confirm('이미지를 삭제하시겠습니까?')) {
        try {
          // 1. 데이터베이스에서 이미지 정보 삭제
          const response = await fetch(`/api/admin/hospitals/${hospitalId}/images/${imageId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('데이터베이스 삭제 실패');
          }

          const result = await response.json();

          // 2. Supabase Storage에서 파일 삭제
          if (result.storagePath) {
            const deleteResult = await deleteHospitalImageClient(result.storagePath);
            if (!deleteResult.success) {
              console.error('Storage delete failed:', deleteResult.error);
              // 스토리지 삭제 실패해도 DB는 이미 삭제됨
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
    [hospitalId, refetch],
  );

  // 이미지 타입별 그룹화
  const imagesByType: Record<HospitalImageType, HospitalImage[]> =
    hospitalImages?.reduce(
      (acc, image) => {
        if (!acc[image.imageType]) {
          acc[image.imageType] = [];
        }
        acc[image.imageType].push(image);
        return acc;
      },
      {} as Record<HospitalImageType, HospitalImage[]>,
    ) || ({} as Record<HospitalImageType, HospitalImage[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>병원 이미지</CardTitle>
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
          <CardTitle>병원 이미지</CardTitle>
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
        <CardTitle>병원 이미지</CardTitle>
        <p className='text-muted-foreground text-sm'>
          병원의 다양한 이미지를 업로드하고 관리할 수 있습니다. (최대 500KB, 모든 이미지 형식 지원)
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HospitalImageType)}>
          <TabsList className='grid w-full grid-cols-5'>
            {Object.entries(IMAGE_TYPE_LABELS).map(([type, label]) => {
              const existingCount = imagesByType[type as HospitalImageType]?.length || 0;
              const selectedCount = selectedFiles[type as HospitalImageType].length;
              const limit = IMAGE_TYPE_LIMITS[type as HospitalImageType];

              return (
                <TabsTrigger key={type} value={type} className='text-xs'>
                  <div className='flex flex-col items-center'>
                    <span>{label}</span>
                    <Badge variant='secondary' className='text-xs'>
                      {existingCount + selectedCount}/{limit}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(IMAGE_TYPE_LABELS).map(([type, label]) => {
            const imageType = type as HospitalImageType;
            const existingImages = imagesByType[imageType] || [];
            const selectedFilesForType = selectedFiles[imageType];
            const limit = IMAGE_TYPE_LIMITS[imageType];
            const currentCount = existingImages.length + selectedFilesForType.length;
            const canUpload = currentCount < limit;
            const validFiles = selectedFilesForType.filter((file) => !file.error);

            return (
              <TabsContent key={type} value={type} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>{label}</h3>
                  <div className='text-muted-foreground text-sm'>
                    {currentCount}/{limit}장
                  </div>
                </div>

                {/* 파일 업로드 영역 */}
                <div
                  className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    dragOver === imageType
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, imageType)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, imageType)}
                >
                  <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                  <p className='mb-1 text-sm font-medium'>
                    이미지를 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className='text-muted-foreground mb-4 text-xs'>
                    모든 이미지 형식 지원 (최대 500KB)
                  </p>

                  <input
                    ref={(el) => {
                      if (fileInputRefs.current) {
                        fileInputRefs.current[imageType] = el;
                      }
                    }}
                    type='file'
                    accept='image/*'
                    multiple
                    onChange={(e) => handleFileSelect(e, imageType)}
                    className='hidden'
                  />

                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => fileInputRefs.current[imageType]?.click()}
                    disabled={!canUpload}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    파일 선택
                  </Button>

                  {!canUpload && (
                    <p className='text-destructive mt-2 text-xs'>
                      최대 {limit}장까지만 업로드할 수 있습니다.
                    </p>
                  )}
                </div>

                {/* 선택된 파일 미리보기 */}
                {selectedFilesForType.length > 0 && (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-sm font-medium'>선택된 파일</h4>
                      <Button
                        onClick={() => handleUpload(imageType)}
                        disabled={validFiles.length === 0 || uploading[imageType]}
                        size='sm'
                      >
                        {uploading[imageType] ? (
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
                      {selectedFilesForType.map((file) => (
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
                            onClick={() => removeSelectedFile(imageType, file.id)}
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

                {/* 기존 이미지 목록 */}
                {existingImages.length > 0 && (
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>업로드된 이미지</h4>

                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                      {existingImages.map((image: HospitalImage) => (
                        <div key={image.id} className='group relative'>
                          <div className='relative aspect-square overflow-hidden rounded-lg border'>
                            <Image
                              src={image.imageUrl}
                              alt={image.alt || `${label || '병원'} 이미지`}
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

                {existingImages.length === 0 && selectedFilesForType.length === 0 && (
                  <div className='text-muted-foreground py-8 text-center'>
                    아직 업로드된 {label.toLowerCase()}가 없습니다.
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
