'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeft } from 'lucide-react';
import { useBannerForm } from '../model/useBannerForm';
import { useCreateBanner, useUpdateBanner } from '@/lib/mutations/banner-mutations';
import { useBanner } from '@/lib/queries/banner-images';
import { BannerImageUploadSection } from './BannerImageUploadSection';
import { IMAGE_LOCALE_LABELS, IMAGE_LOCALE_FLAGS } from '@/features/banner-management/api';
import { DatePicker } from '@/shared/ui/date-picker';
import { type MultilingualTitle } from '@/features/banner-management/api';

interface BannerFormProps {
  bannerId?: string;
}

export function BannerForm({ bannerId }: BannerFormProps) {
  const router = useRouter();
  const isEdit = !!bannerId;

  const { data: bannerData, isLoading } = useBanner(bannerId || '');
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const { formData, errors, updateFormData, updateTitle, validateForm, getFormDataForSubmission } =
    useBannerForm();

  // bannerData가 로드되면 폼 데이터 업데이트
  useEffect(() => {
    if (bannerData && isEdit) {
      updateFormData({
        title: bannerData.title as MultilingualTitle,
        linkUrl: bannerData.linkUrl,
        order: bannerData.order,
        isActive: bannerData.isActive,
        startDate: new Date(bannerData.startDate),
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : undefined,
      });
    }
  }, [bannerData, isEdit, updateFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data = getFormDataForSubmission();

      if (isEdit && bannerId) {
        await updateMutation.mutateAsync({ id: bannerId, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }

      router.push('/admin/banners');
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleBack = () => {
    router.push('/admin/banners');
  };

  if (isEdit && isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>{isEdit ? '배너 수정' : '배너 추가'}</h2>
          <p className='text-muted-foreground'>
            {isEdit ? '배너 정보를 수정합니다.' : '새로운 배너를 추가합니다.'}
          </p>
        </div>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          목록으로
        </Button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* 다국어 제목 */}
            <div className='space-y-4'>
              <Label>제목 (다국어)</Label>
              {(['ko', 'en', 'th'] as const).map((locale) => (
                <div key={locale} className='space-y-2'>
                  <Label className='flex items-center text-sm font-medium'>
                    {IMAGE_LOCALE_FLAGS[locale]} {IMAGE_LOCALE_LABELS[locale]}
                  </Label>
                  <Input
                    value={formData.title[locale]}
                    onChange={(e) => updateTitle(locale, e.target.value)}
                    placeholder={`${IMAGE_LOCALE_LABELS[locale]} 제목을 입력하세요`}
                    className={errors.title?.[locale] ? 'border-destructive' : ''}
                  />
                  {errors.title?.[locale] && (
                    <p className='text-destructive text-sm'>{errors.title[locale]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* 링크 URL */}
            <div className='space-y-2'>
              <Label htmlFor='linkUrl'>링크 URL</Label>
              <Input
                id='linkUrl'
                value={formData.linkUrl}
                onChange={(e) => updateFormData({ linkUrl: e.target.value })}
                placeholder='https://example.com'
                className={errors.linkUrl ? 'border-destructive' : ''}
              />
              {errors.linkUrl && <p className='text-destructive text-sm'>{errors.linkUrl}</p>}
            </div>

            {/* 순서 */}
            <div className='space-y-2'>
              <Label htmlFor='order'>표시 순서</Label>
              <Input
                id='order'
                type='number'
                min='0'
                value={formData.order}
                onChange={(e) => updateFormData({ order: parseInt(e.target.value) || 0 })}
                className={errors.order ? 'border-destructive' : ''}
              />
              {errors.order && <p className='text-destructive text-sm'>{errors.order}</p>}
            </div>

            {/* 활성화 여부 */}
            <div className='flex items-center space-x-2'>
              <Switch
                id='isActive'
                checked={formData.isActive}
                onCheckedChange={(checked) => updateFormData({ isActive: checked })}
              />
              <Label htmlFor='isActive'>활성화</Label>
            </div>
          </CardContent>
        </Card>

        {/* 노출 기간 */}
        <Card>
          <CardHeader>
            <CardTitle>노출 기간</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* 시작일 */}
            <div className='space-y-2'>
              <DatePicker
                label='시작일'
                value={formData.startDate}
                onChange={(date) => updateFormData({ startDate: date || new Date() })}
                locale='ko'
                placeholder='시작일을 선택하세요'
                required={true}
                error={errors.startDate}
                yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 5 }}
              />
            </div>

            {/* 종료일 */}
            <div className='space-y-2'>
              <DatePicker
                label='종료일 (선택사항)'
                value={formData.endDate}
                onChange={(date) => updateFormData({ endDate: date })}
                locale='ko'
                placeholder='종료일을 선택하세요 (선택사항)'
                required={false}
                error={errors.endDate}
                disabled={(date) => (formData.startDate ? date <= formData.startDate : false)}
                yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 5 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 이미지 업로드 */}
        {isEdit && bannerId && <BannerImageUploadSection bannerId={bannerId} />}

        {/* 저장 버튼 */}
        <div className='flex justify-end space-x-2'>
          <Button type='button' variant='outline' onClick={handleBack}>
            취소
          </Button>
          <Button type='submit' disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className='mr-2 h-4 w-4' />
            {createMutation.isPending || updateMutation.isPending
              ? '저장 중...'
              : isEdit
                ? '수정'
                : '추가'}
          </Button>
        </div>
      </form>
    </div>
  );
}
