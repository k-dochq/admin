'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useYoutubeVideoById, useUpdateYoutubeVideo } from '@/lib/queries/youtube-videos';
import { YoutubeVideoForm } from './YoutubeVideoForm';
import { ThumbnailUploadSection } from './ThumbnailUploadSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { LoadingSpinner } from '@/shared/ui';
import type { UpdateYoutubeVideoRequest } from '../api/entities/types';

interface YoutubeVideoEditPageProps {
  videoId: string;
}

export function YoutubeVideoEditPage({ videoId }: YoutubeVideoEditPageProps) {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const [formData, setFormData] = useState({
    categoryId: '',
    title: {
      ko: '',
      en: '',
      th: '',
      zh: '',
      ja: '',
      hi: '',
      tl: '',
      ar: '',
      ru: '',
    },
    description: {
      ko: '',
      en: '',
      th: '',
      zh: '',
      ja: '',
      hi: '',
      tl: '',
      ar: '',
      ru: '',
    },
    videoUrl: {
      ko: '',
      en: '',
      th: '',
      zh: '',
      ja: '',
      hi: '',
      tl: '',
      ar: '',
      ru: '',
    },
    order: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<{
    categoryId?: string;
    title?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
      hi?: string;
      tl?: string;
      ar?: string;
      ru?: string;
    };
    description?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
      hi?: string;
      tl?: string;
      ar?: string;
      ru?: string;
    };
    videoUrl?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
      hi?: string;
      tl?: string;
      ar?: string;
      ru?: string;
    };
  }>({});

  const { data: existingVideo, isLoading: isLoadingVideo } = useYoutubeVideoById(videoId);
  const updateVideoMutation = useUpdateYoutubeVideo();

  // 기존 데이터 로드
  useEffect(() => {
    if (existingVideo) {
      const titleObj = existingVideo.title as Record<string, unknown>;
      const descObj = existingVideo.description as Record<string, unknown> | null;
      const videoUrlObj = existingVideo.videoUrl as Record<string, unknown>;
      setFormData({
        categoryId: existingVideo.categoryId,
        title: {
          ko: (titleObj.ko as string) || '',
          en: (titleObj.en as string) || '',
          th: (titleObj.th as string) || '',
          zh: (titleObj.zh as string) || '',
          ja: (titleObj.ja as string) || '',
          hi: (titleObj.hi as string) || '',
          tl: (titleObj.tl as string) || '',
          ar: (titleObj.ar as string) || '',
          ru: (titleObj.ru as string) || '',
        },
        description: {
          ko: (descObj?.ko as string) || '',
          en: (descObj?.en as string) || '',
          th: (descObj?.th as string) || '',
          zh: (descObj?.zh as string) || '',
          ja: (descObj?.ja as string) || '',
          hi: (descObj?.hi as string) || '',
          tl: (descObj?.tl as string) || '',
          ar: (descObj?.ar as string) || '',
          ru: (descObj?.ru as string) || '',
        },
        videoUrl: {
          ko: (videoUrlObj.ko as string) || '',
          en: (videoUrlObj.en as string) || '',
          th: (videoUrlObj.th as string) || '',
          zh: (videoUrlObj.zh as string) || '',
          ja: (videoUrlObj.ja as string) || '',
          hi: (videoUrlObj.hi as string) || '',
          tl: (videoUrlObj.tl as string) || '',
          ar: (videoUrlObj.ar as string) || '',
          ru: (videoUrlObj.ru as string) || '',
        },
        order: existingVideo.order?.toString() || '',
        isActive: existingVideo.isActive,
      });
    }
  }, [existingVideo]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field as keyof typeof newErrors];
      }
      return newErrors;
    });
  };

  const updateNestedField = (
    field: 'title' | 'description' | 'videoUrl',
    locale: 'ko' | 'en' | 'th' | 'zh' | 'ja' | 'hi' | 'tl' | 'ar' | 'ru',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
    // 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        const fieldErrors = newErrors[field] as Record<string, string>;
        delete fieldErrors[locale];
      }
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }

    if (!formData.title.ko.trim()) {
      newErrors.title = { ...newErrors.title, ko: '한국어 제목은 필수입니다.' };
    }

    if (!formData.videoUrl.ko.trim()) {
      newErrors.videoUrl = { ...newErrors.videoUrl, ko: '한국어 영상 링크는 필수입니다.' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateYoutubeVideoRequest = {
        categoryId: formData.categoryId,
        title: {
          ko: formData.title.ko,
          en: formData.title.en || formData.title.ko,
          th: formData.title.th || formData.title.ko,
          zh: formData.title.zh || formData.title.ko,
          ja: formData.title.ja || formData.title.ko,
          hi: formData.title.hi || formData.title.ko,
          tl: formData.title.tl || formData.title.ko,
          ar: formData.title.ar || formData.title.ko,
          ru: formData.title.ru || formData.title.ko,
        },
        description:
          formData.description.ko ||
          formData.description.en ||
          formData.description.th ||
          formData.description.zh ||
          formData.description.ja ||
          formData.description.hi ||
          formData.description.tl ||
          formData.description.ar ||
          formData.description.ru
            ? {
                ko: formData.description.ko,
                en: formData.description.en,
                th: formData.description.th,
                zh: formData.description.zh,
                ja: formData.description.ja,
                hi: formData.description.hi,
                tl: formData.description.tl,
                ar: formData.description.ar,
                ru: formData.description.ru,
              }
            : null,
        videoUrl: {
          ko: formData.videoUrl.ko,
          en: formData.videoUrl.en || formData.videoUrl.ko,
          th: formData.videoUrl.th || formData.videoUrl.ko,
          zh: formData.videoUrl.zh || formData.videoUrl.ko,
          ja: formData.videoUrl.ja || formData.videoUrl.ko,
          hi: formData.videoUrl.hi || formData.videoUrl.ko,
          tl: formData.videoUrl.tl || formData.videoUrl.ko,
          ar: formData.videoUrl.ar || formData.videoUrl.ko,
          ru: formData.videoUrl.ru || formData.videoUrl.ko,
        },
        order: formData.order ? parseInt(formData.order) : null,
        isActive: formData.isActive,
      };

      await updateVideoMutation.mutateAsync({ id: videoId, data: updateData });
      router.push('/admin/youtube-videos');
    } catch (error) {
      console.error('영상 수정 실패:', error);
      alert('영상 수정에 실패했습니다.');
    }
  };

  if (isLoadingVideo) {
    return (
      <div className='flex justify-center py-8'>
        <LoadingSpinner text='영상 정보를 불러오는 중...' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/youtube-videos')}
          className='flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
        <h1 className='text-2xl font-bold'>영상 수정</h1>
      </div>

      <YoutubeVideoForm
        formData={formData}
        errors={errors}
        selectedLocale={selectedLocale}
        onUpdateField={updateField}
        onUpdateNestedField={updateNestedField}
        onLocaleChange={setSelectedLocale}
      />

      <ThumbnailUploadSection videoId={videoId} />

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={() => router.push('/admin/youtube-videos')}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={updateVideoMutation.isPending}>
          {updateVideoMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          <Save className='mr-2 h-4 w-4' />
          저장
        </Button>
      </div>
    </div>
  );
}
