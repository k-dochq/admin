'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalImages, useDeleteHospitalImage } from '@/lib/queries/hospital-images';
import { uploadHospitalImageClient, deleteHospitalImageClient } from '@/shared/lib/supabase-client';
import {
  type HospitalImageType,
  type BasicHospitalImageType,
  type HospitalImage,
  IMAGE_TYPE_LIMITS,
  IMAGE_TYPE_LABELS,
} from '../../api/entities/types';
import { type FileWithPreview } from './types';
import { createFileWithPreview, revokeFilePreview } from './lib/file-utils';
import { ImageUploadTabs } from './ImageUploadTabs';
import { ImageUploadTabContent } from './ImageUploadTabContent';

interface ImageUploadSectionProps {
  hospitalId: string;
}

const BASIC_IMAGE_TYPES: BasicHospitalImageType[] = [
  'MAIN',
  'THUMBNAIL',
  'PROMOTION',
  'DETAIL',
  'INTERIOR',
  'LOGO',
];

export function ImageUploadSection({ hospitalId }: ImageUploadSectionProps) {
  const [activeTab, setActiveTab] = useState<BasicHospitalImageType>('MAIN');
  const [selectedFiles, setSelectedFiles] = useState<
    Record<BasicHospitalImageType, FileWithPreview[]>
  >({
    MAIN: [],
    THUMBNAIL: [],
    PROMOTION: [],
    DETAIL: [],
    INTERIOR: [],
    LOGO: [],
  });
  const [dragOver, setDragOver] = useState<BasicHospitalImageType | null>(null);
  const [uploading, setUploading] = useState<Record<BasicHospitalImageType, boolean>>({
    MAIN: false,
    THUMBNAIL: false,
    PROMOTION: false,
    DETAIL: false,
    INTERIOR: false,
    LOGO: false,
  });

  const fileInputRefs = useRef<Record<BasicHospitalImageType, HTMLInputElement | null>>({
    MAIN: null,
    THUMBNAIL: null,
    PROMOTION: null,
    DETAIL: null,
    INTERIOR: null,
    LOGO: null,
  });

  const { data: hospitalImages, isLoading, error, refetch } = useHospitalImages(hospitalId);
  const deleteMutation = useDeleteHospitalImage();

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, imageType: BasicHospitalImageType) => {
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
        alert(`${IMAGE_TYPE_LIMITS[imageType]}는 최대 ${limit}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [imageType]: [...prev[imageType], ...filesToAdd],
      }));

      event.target.value = '';
    },
    [selectedFiles, hospitalImages],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback(
    (event: React.DragEvent, imageType: BasicHospitalImageType) => {
      event.preventDefault();
      setDragOver(imageType);
    },
    [],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, imageType: BasicHospitalImageType) => {
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
        alert(`${IMAGE_TYPE_LIMITS[imageType]}는 최대 ${limit}장까지만 업로드할 수 있습니다.`);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots).map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [imageType]: [...prev[imageType], ...filesToAdd],
      }));
    },
    [selectedFiles, hospitalImages],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback((imageType: BasicHospitalImageType, fileId: string) => {
    setSelectedFiles((prev) => {
      const file = prev[imageType].find((f) => f.id === fileId);
      if (file) {
        revokeFilePreview(file);
      }
      return {
        ...prev,
        [imageType]: prev[imageType].filter((f) => f.id !== fileId),
      };
    });
  }, []);

  // 업로드 핸들러
  const handleUpload = useCallback(
    async (imageType: BasicHospitalImageType) => {
      const files = selectedFiles[imageType].filter((file) => !file.error);
      if (files.length === 0) return;

      setUploading((prev) => ({ ...prev, [imageType]: true }));

      try {
        const uploadPromises = files.map(async (file) => {
          if (!file || !file.name || file.size === 0) {
            throw new Error('유효하지 않은 파일입니다.');
          }

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
            if (uploadResult.path) {
              await deleteHospitalImageClient(uploadResult.path);
            }
            throw new Error('데이터베이스 저장 실패');
          }

          return response.json();
        });

        await Promise.all(uploadPromises);

        // 성공 시 선택된 파일들 정리
        selectedFiles[imageType].forEach(revokeFilePreview);
        setSelectedFiles((prev) => ({
          ...prev,
          [imageType]: [],
        }));

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

  // 기존 이미지 삭제 핸들러
  const handleDelete = useCallback(
    async (imageId: string) => {
      if (confirm('이미지를 삭제하시겠습니까?')) {
        try {
          const response = await fetch(`/api/admin/hospitals/${hospitalId}/images/${imageId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('데이터베이스 삭제 실패');
          }

          const result = await response.json();

          if (result.storagePath) {
            await deleteHospitalImageClient(result.storagePath);
          }

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
        <ImageUploadTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedFiles={selectedFiles}
          imagesByType={imagesByType}
        >
          {BASIC_IMAGE_TYPES.map((type) => {
            const existingImages = imagesByType[type] || [];
            const selectedFilesForType = selectedFiles[type];

            return (
              <ImageUploadTabContent
                key={type}
                ref={(el) => {
                  fileInputRefs.current[type] = el;
                }}
                imageType={type}
                existingImages={existingImages}
                selectedFiles={selectedFilesForType}
                limit={IMAGE_TYPE_LIMITS[type]}
                isDragOver={dragOver === type}
                isUploading={uploading[type]}
                onFileSelect={(e) => handleFileSelect(e, type)}
                onDragOver={(e) => handleDragOver(e, type)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, type)}
                onFileInputClick={() => fileInputRefs.current[type]?.click()}
                onRemoveSelectedFile={(fileId) => removeSelectedFile(type, fileId)}
                onUpload={() => handleUpload(type)}
                onDeleteImage={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            );
          })}
        </ImageUploadTabs>
      </CardContent>
    </Card>
  );
}
