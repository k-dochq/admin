'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  useHospitalCategory,
  useCreateHospitalCategory,
  useUpdateHospitalCategory,
} from '@/lib/queries/hospital-categories';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { CreateHospitalCategoryRequest } from '../api';
import { Prisma } from '@prisma/client';

interface HospitalCategoryFormProps {
  categoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function HospitalCategoryForm({
  categoryId,
  onSuccess,
  onCancel,
}: HospitalCategoryFormProps) {
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const [formData, setFormData] = useState({
    name: {
      ko_KR: '',
      en_US: '',
      th_TH: '',
      zh_TW: '',
      ja_JP: '',
      hi_IN: '',
      tl_PH: '',
    },
    description: {
      ko_KR: '',
      en_US: '',
      th_TH: '',
      zh_TW: '',
      ja_JP: '',
      hi_IN: '',
      tl_PH: '',
    },
    order: '',
    isActive: true,
  });

  const { data: existingCategory, isLoading: isLoadingCategory } = useHospitalCategory(
    categoryId || '',
  );
  const createMutation = useCreateHospitalCategory();
  const updateMutation = useUpdateHospitalCategory();

  // 기존 데이터 로드
  useEffect(() => {
    if (existingCategory) {
      const nameObj = existingCategory.name as Prisma.JsonValue;
      const descObj = existingCategory.description as Prisma.JsonValue | null;

      const parseJson = (json: Prisma.JsonValue): Record<string, string> => {
        if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
          return json as Record<string, string>;
        }
        return {};
      };

      const nameParsed = parseJson(nameObj);
      const descParsed = descObj ? parseJson(descObj) : {};

      setFormData({
        name: {
          ko_KR: nameParsed.ko_KR || '',
          en_US: nameParsed.en_US || '',
          th_TH: nameParsed.th_TH || '',
          zh_TW: nameParsed.zh_TW || '',
          ja_JP: nameParsed.ja_JP || '',
          hi_IN: nameParsed.hi_IN || '',
          tl_PH: nameParsed.tl_PH || '',
        },
        description: {
          ko_KR: descParsed.ko_KR || '',
          en_US: descParsed.en_US || '',
          th_TH: descParsed.th_TH || '',
          zh_TW: descParsed.zh_TW || '',
          ja_JP: descParsed.ja_JP || '',
          hi_IN: descParsed.hi_IN || '',
          tl_PH: descParsed.tl_PH || '',
        },
        order: existingCategory.order?.toString() || '',
        isActive: existingCategory.isActive,
      });
    }
  }, [existingCategory]);

  const updateField = (field: 'name' | 'description', locale: HospitalLocale, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestData: CreateHospitalCategoryRequest = {
      name: formData.name,
      description:
        formData.description.ko_KR ||
        formData.description.en_US ||
        formData.description.th_TH ||
        formData.description.zh_TW ||
        formData.description.ja_JP ||
        formData.description.hi_IN
          ? formData.description
          : undefined,
      order: formData.order ? parseInt(formData.order, 10) : undefined,
      isActive: formData.isActive,
    };

    try {
      if (categoryId) {
        await updateMutation.mutateAsync({ id: categoryId, data: requestData });
      } else {
        await createMutation.mutateAsync(requestData);
      }
      onSuccess();
    } catch (error) {
      console.error('카테고리 저장 실패:', error);
    }
  };

  if (isLoadingCategory && categoryId) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />

      <div className='space-y-4'>
        <div>
          <Label htmlFor='name'>카테고리 이름 *</Label>
          <Input
            id='name'
            value={formData.name[selectedLocale]}
            onChange={(e) => updateField('name', selectedLocale, e.target.value)}
            placeholder='카테고리 이름을 입력하세요'
            required
          />
        </div>

        <div>
          <Label htmlFor='description'>설명</Label>
          <Textarea
            id='description'
            value={formData.description[selectedLocale]}
            onChange={(e) => updateField('description', selectedLocale, e.target.value)}
            placeholder='카테고리 설명을 입력하세요'
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor='order'>정렬 순서</Label>
          <Input
            id='order'
            type='number'
            value={formData.order}
            onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
            placeholder='숫자가 작을수록 앞에 표시'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='isActive'
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor='isActive'>활성화</Label>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          취소
        </Button>
        <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {categoryId ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
