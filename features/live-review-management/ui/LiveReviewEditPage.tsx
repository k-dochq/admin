'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useLiveReviewById, useUpdateLiveReview } from '@/lib/queries/live-reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useLiveReviewForm } from '../model/useLiveReviewForm';
import { BasicInfoSection } from './BasicInfoSection';
import { ContentSection } from './ContentSection';
import { ImageUploadSection } from './ImageUploadSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { UpdateLiveReviewRequest } from '../api/entities/types';

interface LiveReviewEditPageProps {
  liveReviewId: string;
}

export function LiveReviewEditPage({ liveReviewId }: LiveReviewEditPageProps) {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const { data: liveReview, isLoading, error } = useLiveReviewById(liveReviewId, true);
  const { data: medicalSpecialties } = useMedicalSpecialties();
  const { data: hospitalsData } = useHospitals({ limit: 10000 });
  const updateLiveReviewMutation = useUpdateLiveReview();

  const { formData, errors, isDirty, updateField, updateNestedField, validateForm, hasErrors } =
    useLiveReviewForm(liveReview);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateLiveReviewRequest = {
        content: {
          ko_KR: formData.content.ko_KR,
          en_US: formData.content.en_US,
          th_TH: formData.content.th_TH,
        },
        detailLink: formData.detailLink || null,
        order: formData.order,
        isActive: formData.isActive,
        medicalSpecialtyId: formData.medicalSpecialtyId,
        hospitalId: formData.hospitalId,
      };

      await updateLiveReviewMutation.mutateAsync({
        id: liveReviewId,
        data: updateData,
      });
      router.push('/admin/live-reviews');
    } catch (error) {
      console.error('생생후기 정보 업데이트 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text='생생후기 정보를 불러오는 중...' />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>생생후기 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => router.push('/admin/live-reviews')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!liveReview) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>생생후기를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/live-reviews')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/live-reviews')}
          className='flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
        <h1 className='text-2xl font-bold'>생생후기 수정</h1>
      </div>

      <div className='flex justify-end'>
        <Button
          onClick={handleSubmit}
          disabled={!isDirty || hasErrors || updateLiveReviewMutation.isPending}
        >
          {updateLiveReviewMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          저장
        </Button>
      </div>

      {/* 언어 선택 */}
      <div className='flex justify-center'>
        <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />
      </div>

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 기본 정보 */}
        <BasicInfoSection
          medicalSpecialtyId={formData.medicalSpecialtyId}
          hospitalId={formData.hospitalId}
          detailLink={formData.detailLink}
          order={formData.order}
          isActive={formData.isActive}
          medicalSpecialties={medicalSpecialties || []}
          hospitals={hospitalsData?.hospitals || []}
          errors={errors}
          onUpdateMedicalSpecialtyId={(value: string) => updateField('medicalSpecialtyId', value)}
          onUpdateHospitalId={(value: string) => updateField('hospitalId', value)}
          onUpdateDetailLink={(value: string) => updateField('detailLink', value)}
          onUpdateOrder={(value: number | null) => updateField('order', value)}
          onUpdateIsActive={(value: boolean) => updateField('isActive', value)}
        />

        {/* 내용 섹션 */}
        <ContentSection
          content={formData.content}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdateContent={(field, value) => updateNestedField('content', field, value)}
        />

        {/* 생생후기 이미지 */}
        <ImageUploadSection liveReviewId={liveReviewId} />
      </div>
    </div>
  );
}
