'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  useYoutubeVideoCategoryById,
  useCreateYoutubeVideoCategory,
  useUpdateYoutubeVideoCategory,
} from '@/lib/queries/youtube-video-categories';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { CreateYoutubeVideoCategoryRequest } from '../api/entities/types';

interface YoutubeVideoCategoryFormProps {
  categoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function YoutubeVideoCategoryForm({
  categoryId,
  onSuccess,
  onCancel,
}: YoutubeVideoCategoryFormProps) {
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const [formData, setFormData] = useState({
    name: {
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
    order: '',
    isActive: true,
  });

  const { data: existingCategory, isLoading: isLoadingCategory } = useYoutubeVideoCategoryById(
    categoryId || '',
    !!categoryId,
  );
  const createMutation = useCreateYoutubeVideoCategory();
  const updateMutation = useUpdateYoutubeVideoCategory();

  // 기존 데이터 로드
  useEffect(() => {
    if (existingCategory) {
      const nameObj = existingCategory.name as Record<string, unknown>;
      const descObj = existingCategory.description as Record<string, unknown> | null;
      setFormData({
        name: {
          ko: (nameObj.ko as string) || '',
          en: (nameObj.en as string) || '',
          th: (nameObj.th as string) || '',
          zh: (nameObj.zh as string) || '',
          ja: (nameObj.ja as string) || '',
        },
        description: {
          ko: (descObj?.ko as string) || '',
          en: (descObj?.en as string) || '',
          th: (descObj?.th as string) || '',
          zh: (descObj?.zh as string) || '',
          ja: (descObj?.ja as string) || '',
        },
        order: existingCategory.order?.toString() || '',
        isActive: existingCategory.isActive,
      });
    }
  }, [existingCategory]);

  const updateField = (
    field: 'name' | 'description',
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
  };

  const handleSubmit = async () => {
    if (!formData.name.ko.trim()) {
      alert('한국어 카테고리명은 필수입니다.');
      return;
    }

    try {
      const requestData: CreateYoutubeVideoCategoryRequest = {
        name: {
          ko: formData.name.ko,
          en: formData.name.en || formData.name.ko,
          th: formData.name.th || formData.name.ko,
          zh: formData.name.zh || formData.name.ko,
          ja: formData.name.ja || formData.name.ko,
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
        order: formData.order ? parseInt(formData.order) : null,
        isActive: formData.isActive,
      };

      if (categoryId) {
        await updateMutation.mutateAsync({ id: categoryId, data: requestData });
      } else {
        await createMutation.mutateAsync(requestData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('카테고리 저장에 실패했습니다.');
    }
  };

  if (isLoadingCategory) {
    return <div className='flex justify-center py-8'>로딩 중...</div>;
  }

  const localeMap: Record<HospitalLocale, 'ko' | 'en' | 'th' | 'zh' | 'ja'> = {
    ko_KR: 'ko',
    en_US: 'en',
    th_TH: 'th',
    zh_TW: 'zh',
    ja_JP: 'ja',
  };

  const currentLocale = localeMap[selectedLocale];

  return (
    <div className='space-y-6'>
      <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>카테고리명 *</Label>
          <Input
            id='name'
            value={formData.name[currentLocale]}
            onChange={(e) => updateField('name', currentLocale, e.target.value)}
            placeholder={
              selectedLocale === 'ko_KR'
                ? '한국어 카테고리명'
                : selectedLocale === 'en_US'
                  ? 'English category name'
                  : selectedLocale === 'th_TH'
                    ? 'ชื่อหมวดหมู่'
                    : selectedLocale === 'zh_TW'
                      ? '繁體中文類別名稱'
                      : '日本語カテゴリ名'
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>설명</Label>
          <Textarea
            id='description'
            value={formData.description[currentLocale]}
            onChange={(e) => updateField('description', currentLocale, e.target.value)}
            placeholder={
              selectedLocale === 'ko_KR'
                ? '한국어 설명'
                : selectedLocale === 'en_US'
                  ? 'English description'
                  : selectedLocale === 'th_TH'
                    ? 'คำอธิบาย'
                    : selectedLocale === 'zh_TW'
                      ? '繁體中文說明'
                      : '日本語説明'
            }
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='order'>정렬순서</Label>
          <Input
            id='order'
            type='number'
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
            placeholder='숫자가 작을수록 앞에 표시됩니다'
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label htmlFor='isActive'>활성화</Label>
          <Switch
            id='isActive'
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onCancel}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {categoryId ? '수정' : '추가'}
        </Button>
      </div>
    </div>
  );
}
