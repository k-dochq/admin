'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Loader2, X, Plus, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalImages, useDeleteHospitalImage } from '@/lib/queries/hospital-images';
import { uploadHospitalImageClient, deleteHospitalImageClient } from '@/shared/lib/supabase-client';
import {
  type HospitalImageType,
  type HospitalImage,
  IMAGE_TYPE_LABELS,
} from '../api/entities/types';
import { LanguageTabs, type HospitalLocale } from './LanguageTabs';

interface AdditionalMediaSectionProps {
  hospitalId: string;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

type MediaTabType = 'PROCEDURE_DETAIL' | 'VIDEO_THUMBNAIL' | 'VIDEO';

const MEDIA_TAB_TYPES: MediaTabType[] = ['PROCEDURE_DETAIL', 'VIDEO_THUMBNAIL', 'VIDEO'];

const MEDIA_TAB_LABELS: Record<MediaTabType, string> = {
  PROCEDURE_DETAIL: '시술상세이미지',
  VIDEO_THUMBNAIL: '영상썸네일이미지',
  VIDEO: '영상링크',
};

export function AdditionalMediaSection({ hospitalId }: AdditionalMediaSectionProps) {
  const [activeTab, setActiveTab] = useState<MediaTabType>('PROCEDURE_DETAIL');
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const [selectedFiles, setSelectedFiles] = useState<
    Record<MediaTabType, Record<HospitalLocale, FileWithPreview[]>>
  >({
    PROCEDURE_DETAIL: { ko_KR: [], en_US: [], th_TH: [] },
    VIDEO_THUMBNAIL: { ko_KR: [], en_US: [], th_TH: [] },
    VIDEO: { ko_KR: [], en_US: [], th_TH: [] },
  });
  const [videoLinks, setVideoLinks] = useState<Record<HospitalLocale, string>>({
    ko_KR: '',
    en_US: '',
    th_TH: '',
  });
  const [dragOver, setDragOver] = useState<{
    tab: MediaTabType;
    locale: HospitalLocale;
  } | null>(null);
  const [uploading, setUploading] = useState<Record<MediaTabType, Record<HospitalLocale, boolean>>>(
    {
      PROCEDURE_DETAIL: { ko_KR: false, en_US: false, th_TH: false },
      VIDEO_THUMBNAIL: { ko_KR: false, en_US: false, th_TH: false },
      VIDEO: { ko_KR: false, en_US: false, th_TH: false },
    },
  );
  const [savingVideoLink, setSavingVideoLink] = useState<Record<HospitalLocale, boolean>>({
    ko_KR: false,
    en_US: false,
    th_TH: false,
  });

  const fileInputRefs = useRef<
    Record<MediaTabType, Record<HospitalLocale, HTMLInputElement | null>>
  >({
    PROCEDURE_DETAIL: { ko_KR: null, en_US: null, th_TH: null },
    VIDEO_THUMBNAIL: { ko_KR: null, en_US: null, th_TH: null },
    VIDEO: { ko_KR: null, en_US: null, th_TH: null },
  });

  const { data: hospitalImages, isLoading, error, refetch } = useHospitalImages(hospitalId);
  const deleteMutation = useDeleteHospitalImage();

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
    (event: React.ChangeEvent<HTMLInputElement>, tab: MediaTabType, locale: HospitalLocale) => {
      const files = Array.from(event.target.files || []).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const filesToAdd = files.map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: [...prev[tab][locale], ...filesToAdd],
        },
      }));

      event.target.value = '';
    },
    [createFileWithPreview],
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback(
    (event: React.DragEvent, tab: MediaTabType, locale: HospitalLocale) => {
      event.preventDefault();
      setDragOver({ tab, locale });
    },
    [],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, tab: MediaTabType, locale: HospitalLocale) => {
      event.preventDefault();
      setDragOver(null);

      const files = Array.from(event.dataTransfer.files).filter(
        (file) => file && file.name && file.size > 0,
      );
      if (files.length === 0) return;

      const filesToAdd = files.map(createFileWithPreview);

      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: [...prev[tab][locale], ...filesToAdd],
        },
      }));
    },
    [createFileWithPreview],
  );

  // 선택된 파일 제거
  const removeSelectedFile = useCallback(
    (tab: MediaTabType, locale: HospitalLocale, fileId: string) => {
      setSelectedFiles((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: prev[tab][locale].filter((file) => {
            if (file.id === fileId) {
              URL.revokeObjectURL(file.preview);
              return false;
            }
            return true;
          }),
        },
      }));
    },
    [],
  );

  // 이미지 업로드 핸들러
  const handleUpload = useCallback(
    async (tab: MediaTabType, locale: HospitalLocale) => {
      const files = selectedFiles[tab][locale].filter((file) => !file.error);
      if (files.length === 0) return;

      setUploading((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          [locale]: true,
        },
      }));

      try {
        const uploadPromises = files.map(async (file) => {
          if (!file || !file.name || file.size === 0) {
            throw new Error('유효하지 않은 파일입니다.');
          }

          const imageType = tab as HospitalImageType;

          // 1. Supabase Storage에 직접 업로드
          const uploadResult = await uploadHospitalImageClient({
            file,
            hospitalId,
            imageType,
          });

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || '업로드 실패');
          }

          // 2. 데이터베이스에 이미지 정보 저장 (언어 정보를 alt나 localizedLinks에 저장)
          // 여기서는 언어 정보를 메타데이터로 저장하거나 별도 필드로 관리
          const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageType,
              imageUrl: uploadResult.imageUrl,
              path: uploadResult.path,
              alt: locale, // 언어 정보를 alt에 임시 저장 (또는 별도 필드 사용)
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
        selectedFiles[tab][locale].forEach((file) => URL.revokeObjectURL(file.preview));
        setSelectedFiles((prev) => ({
          ...prev,
          [tab]: {
            ...prev[tab],
            [locale]: [],
          },
        }));

        refetch();
      } catch (error) {
        console.error('Upload failed:', error);
        alert(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading((prev) => ({
          ...prev,
          [tab]: {
            ...prev[tab],
            [locale]: false,
          },
        }));
      }
    },
    [selectedFiles, hospitalId, refetch],
  );

  // 영상 링크 저장 핸들러
  const handleSaveVideoLink = useCallback(
    async (locale: HospitalLocale) => {
      const link = videoLinks[locale].trim();
      if (!link) {
        alert('영상 링크를 입력해주세요.');
        return;
      }

      // URL 유효성 검사 (간단한 검사)
      try {
        new URL(link);
      } catch {
        alert('유효한 URL을 입력해주세요.');
        return;
      }

      setSavingVideoLink((prev) => ({ ...prev, [locale]: true }));

      try {
        const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageType: 'VIDEO',
            imageUrl: link,
            alt: locale, // 언어 정보를 alt에 저장
          }),
        });

        if (!response.ok) {
          throw new Error('영상 링크 저장 실패');
        }

        setVideoLinks((prev) => ({ ...prev, [locale]: '' }));
        refetch();
      } catch (error) {
        console.error('Save video link failed:', error);
        alert(error instanceof Error ? error.message : '영상 링크 저장 중 오류가 발생했습니다.');
      } finally {
        setSavingVideoLink((prev) => ({ ...prev, [locale]: false }));
      }
    },
    [videoLinks, hospitalId, refetch],
  );

  // 기존 이미지 삭제 핸들러
  const handleDelete = useCallback(
    async (imageId: string) => {
      if (confirm('삭제하시겠습니까?')) {
        try {
          const response = await fetch(`/api/admin/hospitals/${hospitalId}/images/${imageId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('삭제 실패');
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

  // 언어별 이미지 필터링
  const getImagesByLocale = useCallback(
    (imageType: HospitalImageType, locale: HospitalLocale): HospitalImage[] => {
      if (!hospitalImages) return [];
      return hospitalImages.filter((img) => img.imageType === imageType && img.alt === locale);
    },
    [hospitalImages],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text='데이터를 불러오는 중...' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-destructive text-sm'>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>기타 병원 이미지, 영상링크</CardTitle>
        <p className='text-muted-foreground text-sm'>
          시술상세이미지, 영상썸네일이미지, 영상링크를 언어별로 관리할 수 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaTabType)}>
          <TabsList className='grid w-full grid-cols-3'>
            {MEDIA_TAB_TYPES.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {MEDIA_TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {MEDIA_TAB_TYPES.map((tab) => {
            const imageType = tab as HospitalImageType;
            const isVideoLink = tab === 'VIDEO';

            return (
              <TabsContent key={tab} value={tab} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>{MEDIA_TAB_LABELS[tab]}</h3>
                </div>

                {/* 언어 선택 */}
                <div className='flex justify-center py-4'>
                  <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />
                </div>

                {isVideoLink ? (
                  /* 영상 링크 입력 */
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>영상 링크 URL</label>
                      <div className='flex gap-2'>
                        <Input
                          type='url'
                          placeholder='https://example.com/video'
                          value={videoLinks[selectedLocale]}
                          onChange={(e) =>
                            setVideoLinks((prev) => ({ ...prev, [selectedLocale]: e.target.value }))
                          }
                          className='flex-1'
                        />
                        <Button
                          onClick={() => handleSaveVideoLink(selectedLocale)}
                          disabled={
                            !videoLinks[selectedLocale].trim() || savingVideoLink[selectedLocale]
                          }
                        >
                          {savingVideoLink[selectedLocale] ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              저장 중...
                            </>
                          ) : (
                            <>
                              <LinkIcon className='mr-2 h-4 w-4' />
                              저장
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 기존 영상 링크 목록 */}
                    {getImagesByLocale('VIDEO', selectedLocale).length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>저장된 영상 링크</h4>
                        <div className='space-y-2'>
                          {getImagesByLocale('VIDEO', selectedLocale).map((image) => (
                            <div
                              key={image.id}
                              className='flex items-center justify-between rounded-lg border p-3'
                            >
                              <a
                                href={image.imageUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary flex-1 truncate hover:underline'
                              >
                                {image.imageUrl}
                              </a>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDelete(image.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 이미지 업로드 */
                  <>
                    {/* 파일 업로드 영역 */}
                    <div
                      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        dragOver?.tab === tab && dragOver?.locale === selectedLocale
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, tab, selectedLocale)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, tab, selectedLocale)}
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
                          if (fileInputRefs.current[tab]) {
                            fileInputRefs.current[tab][selectedLocale] = el;
                          }
                        }}
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={(e) => handleFileSelect(e, tab, selectedLocale)}
                        className='hidden'
                      />

                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => fileInputRefs.current[tab]?.[selectedLocale]?.click()}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        파일 선택
                      </Button>
                    </div>

                    {/* 선택된 파일 미리보기 */}
                    {selectedFiles[tab][selectedLocale].length > 0 && (
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium'>선택된 파일</h4>
                          <Button
                            onClick={() => handleUpload(tab, selectedLocale)}
                            disabled={
                              selectedFiles[tab][selectedLocale].filter((f) => !f.error).length ===
                                0 || uploading[tab][selectedLocale]
                            }
                            size='sm'
                          >
                            {uploading[tab][selectedLocale] ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                업로드 중...
                              </>
                            ) : (
                              `업로드 (${selectedFiles[tab][selectedLocale].filter((f) => !f.error).length}장)`
                            )}
                          </Button>
                        </div>

                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                          {selectedFiles[tab][selectedLocale].map((file) => (
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
                                onClick={() => removeSelectedFile(tab, selectedLocale, file.id)}
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
                              {file.error && (
                                <div className='text-destructive mt-1 text-xs'>{file.error}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기존 이미지 목록 */}
                    {getImagesByLocale(imageType, selectedLocale).length > 0 && (
                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium'>업로드된 이미지</h4>

                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                          {getImagesByLocale(imageType, selectedLocale).map(
                            (image: HospitalImage) => (
                              <div key={image.id} className='group relative'>
                                <div className='relative aspect-square overflow-hidden rounded-lg border'>
                                  <Image
                                    src={image.imageUrl}
                                    alt={image.alt || `${MEDIA_TAB_LABELS[tab]} 이미지`}
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
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {getImagesByLocale(imageType, selectedLocale).length === 0 &&
                      selectedFiles[tab][selectedLocale].length === 0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                          아직 업로드된 {MEDIA_TAB_LABELS[tab].toLowerCase()}가 없습니다.
                        </div>
                      )}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
