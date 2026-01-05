'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateYoutubeVideo } from '@/lib/queries/youtube-videos';
import { YoutubeVideoForm } from './YoutubeVideoForm';
import { ThumbnailUploadSection } from './ThumbnailUploadSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { CreateYoutubeVideoRequest } from '../api/entities/types';

export function YoutubeVideoAddPage() {
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
    },
    description: {
      ko: '',
      en: '',
      th: '',
      zh: '',
      ja: '',
    },
    videoUrl: {
      ko: '',
      en: '',
      th: '',
      zh: '',
      ja: '',
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
    };
    description?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
    };
    videoUrl?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
    };
  }>({});

  const createVideoMutation = useCreateYoutubeVideo();
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);

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
    locale: 'ko' | 'en' | 'th' | 'zh' | 'ja',
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
      const createData: CreateYoutubeVideoRequest = {
        categoryId: formData.categoryId,
        title: {
          ko: formData.title.ko,
          en: formData.title.en || formData.title.ko,
          th: formData.title.th || formData.title.ko,
          zh: formData.title.zh || formData.title.ko,
          ja: formData.title.ja || formData.title.ko,
        },
        description:
          formData.description.ko ||
          formData.description.en ||
          formData.description.th ||
          formData.description.zh ||
          formData.description.ja
            ? {
                ko: formData.description.ko,
                en: formData.description.en,
                th: formData.description.th,
                zh: formData.description.zh,
                ja: formData.description.ja,
              }
            : null,
        videoUrl: {
          ko: formData.videoUrl.ko,
          en: formData.videoUrl.en || formData.videoUrl.ko,
          th: formData.videoUrl.th || formData.videoUrl.ko,
          zh: formData.videoUrl.zh || formData.videoUrl.ko,
          ja: formData.videoUrl.ja || formData.videoUrl.ko,
        },
        order: formData.order ? parseInt(formData.order) : null,
        isActive: formData.isActive,
      };

      const result = await createVideoMutation.mutateAsync(createData);
      setCreatedVideoId(result.id);
      // 영상 생성 후 수정 페이지로 이동 (썸네일 업로드를 위해)
      router.push(`/admin/youtube-videos/${result.id}/edit`);
    } catch (error) {
      console.error('영상 생성 실패:', error);
      alert('영상 생성에 실패했습니다.');
    }
  };

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
        <h1 className='text-2xl font-bold'>영상 추가</h1>
      </div>

      <YoutubeVideoForm
        formData={formData}
        errors={errors}
        selectedLocale={selectedLocale}
        onUpdateField={updateField}
        onUpdateNestedField={updateNestedField}
        onLocaleChange={setSelectedLocale}
      />

      {createdVideoId && <ThumbnailUploadSection videoId={createdVideoId} />}

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={() => router.push('/admin/youtube-videos')}>
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={createVideoMutation.isPending}>
          {createVideoMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          <Save className='mr-2 h-4 w-4' />
          저장
        </Button>
      </div>
    </div>
  );
}
