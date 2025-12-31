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
  type LocalizedText,
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
  const [selectedFiles, setSelectedFiles] = useState<
    Record<MediaTabType, Record<HospitalLocale, FileWithPreview[]>>
  >({
    PROCEDURE_DETAIL: { ko_KR: [], en_US: [], th_TH: [], zh_TW: [] },
    VIDEO_THUMBNAIL: { ko_KR: [], en_US: [], th_TH: [], zh_TW: [] },
    VIDEO: { ko_KR: [], en_US: [], th_TH: [], zh_TW: [] },
  });
  // 영상 링크: 각 언어별로 모두 입력받음
  const [videoLinks, setVideoLinks] = useState<Record<HospitalLocale, string>>({
    ko_KR: '',
    en_US: '',
    th_TH: '',
    zh_TW: '',
  });
  const [dragOver, setDragOver] = useState<{
    tab: MediaTabType;
    locale: HospitalLocale;
  } | null>(null);
  const [uploading, setUploading] = useState<Record<MediaTabType, Record<HospitalLocale, boolean>>>(
    {
      PROCEDURE_DETAIL: { ko_KR: false, en_US: false, th_TH: false, zh_TW: false },
      VIDEO_THUMBNAIL: { ko_KR: false, en_US: false, th_TH: false, zh_TW: false },
      VIDEO: { ko_KR: false, en_US: false, th_TH: false, zh_TW: false },
    },
  );
  const [savingVideoLink, setSavingVideoLink] = useState<Record<HospitalLocale, boolean>>({
    ko_KR: false,
    en_US: false,
    th_TH: false,
    zh_TW: false,
  });

  const fileInputRefs = useRef<
    Record<MediaTabType, Record<HospitalLocale, HTMLInputElement | null>>
  >({
    PROCEDURE_DETAIL: { ko_KR: null, en_US: null, th_TH: null, zh_TW: null },
    VIDEO_THUMBNAIL: { ko_KR: null, en_US: null, th_TH: null, zh_TW: null },
    VIDEO: { ko_KR: null, en_US: null, th_TH: null, zh_TW: null },
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

  // 이미지 업로드 핸들러: 모든 언어를 한 번에 처리
  const handleUpload = useCallback(
    async (tab: MediaTabType) => {
      // 모든 언어의 파일을 수집
      const allFiles: Array<{ file: FileWithPreview; locale: HospitalLocale }> = [];
      const locales: HospitalLocale[] = ['ko_KR', 'en_US', 'th_TH', 'zh_TW'];

      locales.forEach((locale) => {
        const files = selectedFiles[tab][locale].filter((file) => !file.error);
        files.forEach((file) => {
          allFiles.push({ file, locale });
        });
      });

      if (allFiles.length === 0) return;

      setUploading((prev) => ({
        ...prev,
        [tab]: {
          ko_KR: true,
          en_US: true,
          th_TH: true,
          zh_TW: true,
        },
      }));

      try {
        // 1. 모든 파일을 Supabase Storage에 업로드
        const uploadResults = await Promise.all(
          allFiles.map(async ({ file, locale }) => {
            if (!file || !file.name || file.size === 0) {
              throw new Error('유효하지 않은 파일입니다.');
            }

            const imageType = tab as HospitalImageType;
            const uploadResult = await uploadHospitalImageClient({
              file,
              hospitalId,
              imageType,
            });

            if (!uploadResult.success) {
              throw new Error(uploadResult.error || '업로드 실패');
            }

            return { locale, uploadResult };
          }),
        );

        // 2. 모든 언어의 링크를 localizedLinks로 구성
        const localizedLinks: LocalizedText = {
          ko_KR: undefined,
          en_US: undefined,
          th_TH: undefined,
          zh_TW: undefined,
        };

        uploadResults.forEach(({ locale, uploadResult }) => {
          if (uploadResult.imageUrl) {
            localizedLinks[locale] = uploadResult.imageUrl;
          }
        });

        // 최소 하나의 링크가 있어야 함
        const hasAnyLink = Object.values(localizedLinks).some((url) => url);
        if (!hasAnyLink) {
          throw new Error('업로드된 이미지가 없습니다.');
        }

        // 3. 데이터베이스에 이미지 정보 저장 (모든 언어를 한 번에)
        const imageType = tab as HospitalImageType;
        const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageType,
            imageUrl:
              localizedLinks.en_US ||
              localizedLinks.ko_KR ||
              localizedLinks.th_TH ||
              localizedLinks.zh_TW ||
              '',
            localizedLinks,
          }),
        });

        if (!response.ok) {
          // 실패 시 업로드된 파일들 삭제
          await Promise.all(
            uploadResults.map(({ uploadResult }) => {
              if (uploadResult.path) {
                return deleteHospitalImageClient(uploadResult.path);
              }
            }),
          );
          throw new Error('데이터베이스 저장 실패');
        }

        // 성공 시 선택된 파일들 정리
        locales.forEach((locale) => {
          selectedFiles[tab][locale].forEach((file) => URL.revokeObjectURL(file.preview));
        });
        setSelectedFiles((prev) => ({
          ...prev,
          [tab]: {
            ko_KR: [],
            en_US: [],
            th_TH: [],
            zh_TW: [],
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
            ko_KR: false,
            en_US: false,
            th_TH: false,
            zh_TW: false,
          },
        }));
      }
    },
    [selectedFiles, hospitalId, refetch],
  );

  // 영상 링크 저장 핸들러: 모든 언어를 한 번에 저장
  const handleSaveVideoLink = useCallback(async () => {
    // 최소 하나의 링크가 있어야 함
    const hasAnyLink = Object.values(videoLinks).some((link) => link.trim());
    if (!hasAnyLink) {
      alert('최소 하나의 언어에 영상 링크를 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    const locales: HospitalLocale[] = ['ko_KR', 'en_US', 'th_TH', 'zh_TW'];
    for (const locale of locales) {
      const link = videoLinks[locale].trim();
      if (link) {
        try {
          new URL(link);
        } catch {
          alert(`${locale}의 URL이 유효하지 않습니다.`);
          return;
        }
      }
    }

    setSavingVideoLink({
      ko_KR: true,
      en_US: true,
      th_TH: true,
      zh_TW: true,
    });

    try {
      // 모든 언어의 링크를 localizedLinks로 구성
      const localizedLinks: LocalizedText = {
        ko_KR: videoLinks.ko_KR.trim() || undefined,
        en_US: videoLinks.en_US.trim() || undefined,
        th_TH: videoLinks.th_TH.trim() || undefined,
        zh_TW: videoLinks.zh_TW.trim() || undefined,
      };

      const response = await fetch(`/api/admin/hospitals/${hospitalId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageType: 'VIDEO',
          imageUrl:
            localizedLinks.en_US ||
            localizedLinks.ko_KR ||
            localizedLinks.th_TH ||
            localizedLinks.zh_TW ||
            '',
          localizedLinks,
        }),
      });

      if (!response.ok) {
        throw new Error('영상 링크 저장 실패');
      }

      setVideoLinks({
        ko_KR: '',
        en_US: '',
        th_TH: '',
        zh_TW: '',
      });
      refetch();
    } catch (error) {
      console.error('Save video link failed:', error);
      alert(error instanceof Error ? error.message : '영상 링크 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingVideoLink({
        ko_KR: false,
        en_US: false,
        th_TH: false,
        zh_TW: false,
      });
    }
  }, [videoLinks, hospitalId, refetch]);

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

                {isVideoLink ? (
                  /* 영상 링크 입력 - 모든 언어를 한 번에 */
                  <div className='space-y-4'>
                    <div className='space-y-4'>
                      <label className='text-sm font-medium'>영상 링크 URL (언어별)</label>
                      <div className='space-y-3'>
                        <div className='space-y-2'>
                          <label className='text-muted-foreground text-xs'>한국어 (ko_KR)</label>
                          <Input
                            type='url'
                            placeholder='https://example.com/video-ko'
                            value={videoLinks.ko_KR}
                            onChange={(e) =>
                              setVideoLinks((prev) => ({ ...prev, ko_KR: e.target.value }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-muted-foreground text-xs'>영어 (en_US)</label>
                          <Input
                            type='url'
                            placeholder='https://example.com/video-en'
                            value={videoLinks.en_US}
                            onChange={(e) =>
                              setVideoLinks((prev) => ({ ...prev, en_US: e.target.value }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-muted-foreground text-xs'>태국어 (th_TH)</label>
                          <Input
                            type='url'
                            placeholder='https://example.com/video-th'
                            value={videoLinks.th_TH}
                            onChange={(e) =>
                              setVideoLinks((prev) => ({ ...prev, th_TH: e.target.value }))
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-muted-foreground text-xs'>
                            중국어 번체 (zh_TW)
                          </label>
                          <Input
                            type='url'
                            placeholder='https://example.com/video-zh'
                            value={videoLinks.zh_TW}
                            onChange={(e) =>
                              setVideoLinks((prev) => ({ ...prev, zh_TW: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleSaveVideoLink}
                        disabled={
                          !Object.values(videoLinks).some((link) => link.trim()) ||
                          savingVideoLink.ko_KR ||
                          savingVideoLink.en_US ||
                          savingVideoLink.th_TH ||
                          savingVideoLink.zh_TW
                        }
                        className='w-full'
                      >
                        {savingVideoLink.ko_KR ||
                        savingVideoLink.en_US ||
                        savingVideoLink.th_TH ||
                        savingVideoLink.zh_TW ? (
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

                    {/* 기존 영상 링크 목록 */}
                    {(hospitalImages?.filter((img) => img.imageType === 'VIDEO' && img.isActive)
                      .length ?? 0) > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium'>저장된 영상 링크</h4>
                        <div className='space-y-2'>
                          {hospitalImages
                            ?.filter((img) => img.imageType === 'VIDEO' && img.isActive)
                            .map((image) => {
                              const links = (image.localizedLinks as LocalizedText) || {};

                              return (
                                <div key={image.id} className='space-y-2 rounded-lg border p-3'>
                                  <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium'>영상 링크</span>
                                    <Button
                                      variant='destructive'
                                      size='sm'
                                      onClick={() => handleDelete(image.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                  {links.ko_KR && (
                                    <div className='text-xs'>
                                      <span className='text-muted-foreground'>한국어: </span>
                                      <a
                                        href={links.ko_KR}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary hover:underline'
                                      >
                                        {links.ko_KR}
                                      </a>
                                    </div>
                                  )}
                                  {links.en_US && (
                                    <div className='text-xs'>
                                      <span className='text-muted-foreground'>영어: </span>
                                      <a
                                        href={links.en_US}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary hover:underline'
                                      >
                                        {links.en_US}
                                      </a>
                                    </div>
                                  )}
                                  {links.th_TH && (
                                    <div className='text-xs'>
                                      <span className='text-muted-foreground'>태국어: </span>
                                      <a
                                        href={links.th_TH}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary hover:underline'
                                      >
                                        {links.th_TH}
                                      </a>
                                    </div>
                                  )}
                                  {links.zh_TW && (
                                    <div className='text-xs'>
                                      <span className='text-muted-foreground'>중국어 번체: </span>
                                      <a
                                        href={links.zh_TW}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary hover:underline'
                                      >
                                        {links.zh_TW}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 이미지 업로드 - 모든 언어를 한 번에 */
                  <>
                    <div className='space-y-4'>
                      <p className='text-muted-foreground text-sm'>
                        각 언어별로 이미지를 선택한 후, 하단의 업로드 버튼을 클릭하면 모든 언어의
                        이미지를 한 번에 저장합니다.
                      </p>

                      {/* 언어별 파일 업로드 영역 */}
                      {(['ko_KR', 'en_US', 'th_TH', 'zh_TW'] as HospitalLocale[]).map((locale) => (
                        <div key={locale} className='space-y-2'>
                          <label className='text-sm font-medium'>
                            {locale === 'ko_KR'
                              ? '한국어'
                              : locale === 'en_US'
                                ? '영어'
                                : locale === 'th_TH'
                                  ? '태국어'
                                  : '중국어 번체'}{' '}
                            ({locale})
                          </label>
                          <div
                            className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                              dragOver?.tab === tab && dragOver?.locale === locale
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                            }`}
                            onDragOver={(e) => handleDragOver(e, tab, locale)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, tab, locale)}
                          >
                            <Upload className='text-muted-foreground mx-auto mb-2 h-6 w-6' />
                            <p className='mb-2 text-xs font-medium'>
                              이미지를 드래그하거나 클릭하여 선택
                            </p>

                            <input
                              ref={(el) => {
                                if (fileInputRefs.current[tab]) {
                                  fileInputRefs.current[tab][locale] = el;
                                }
                              }}
                              type='file'
                              accept='image/*'
                              multiple
                              onChange={(e) => handleFileSelect(e, tab, locale)}
                              className='hidden'
                            />

                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => fileInputRefs.current[tab]?.[locale]?.click()}
                            >
                              <Plus className='mr-2 h-3 w-3' />
                              파일 선택
                            </Button>
                          </div>

                          {/* 선택된 파일 미리보기 */}
                          {selectedFiles[tab][locale].length > 0 && (
                            <div className='space-y-2'>
                              <div className='grid grid-cols-3 gap-2'>
                                {selectedFiles[tab][locale].map((file) => (
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
                                      className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0'
                                      onClick={() => removeSelectedFile(tab, locale, file.id)}
                                    >
                                      <X className='h-2.5 w-2.5' />
                                    </Button>

                                    {file.error && (
                                      <div className='bg-destructive/20 absolute inset-0 flex items-center justify-center rounded-lg'>
                                        <div className='bg-destructive text-destructive-foreground flex items-center rounded p-0.5 text-[10px]'>
                                          <AlertCircle className='mr-0.5 h-2 w-2' />
                                          오류
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* 전체 업로드 버튼 */}
                      {(['ko_KR', 'en_US', 'th_TH', 'zh_TW'] as HospitalLocale[]).some(
                        (locale) => selectedFiles[tab][locale].filter((f) => !f.error).length > 0,
                      ) && (
                        <div className='pt-4'>
                          <Button
                            onClick={() => handleUpload(tab)}
                            disabled={
                              !(['ko_KR', 'en_US', 'th_TH', 'zh_TW'] as HospitalLocale[]).some(
                                (locale) =>
                                  selectedFiles[tab][locale].filter((f) => !f.error).length > 0,
                              ) ||
                              uploading[tab].ko_KR ||
                              uploading[tab].en_US ||
                              uploading[tab].th_TH ||
                              uploading[tab].zh_TW
                            }
                            className='w-full'
                          >
                            {uploading[tab].ko_KR ||
                            uploading[tab].en_US ||
                            uploading[tab].th_TH ||
                            uploading[tab].zh_TW ? (
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

                    {/* 기존 이미지 목록 */}
                    {(hospitalImages?.filter((img) => img.imageType === imageType && img.isActive)
                      .length ?? 0) > 0 && (
                      <div className='space-y-4'>
                        <h4 className='text-sm font-medium'>업로드된 이미지</h4>
                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
                          {hospitalImages
                            ?.filter((img) => img.imageType === imageType && img.isActive)
                            .map((image: HospitalImage) => {
                              const links = (image.localizedLinks as LocalizedText) || {};

                              return (
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
                                  {/* 언어별 링크 표시 */}
                                  {(links.ko_KR || links.en_US || links.th_TH || links.zh_TW) && (
                                    <div className='absolute right-0 bottom-0 left-0 bg-black/60 p-1 text-[10px] text-white'>
                                      {links.ko_KR && 'KO '}
                                      {links.en_US && 'EN '}
                                      {links.th_TH && 'TH '}
                                      {links.zh_TW && 'ZH'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {(hospitalImages?.filter((img) => img.imageType === imageType && img.isActive)
                      .length ?? 0) === 0 &&
                      !(['ko_KR', 'en_US', 'th_TH', 'zh_TW'] as HospitalLocale[]).some(
                        (locale) => selectedFiles[tab][locale].length > 0,
                      ) && (
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
