'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useCreateLiveReview } from '@/lib/queries/live-reviews';
import { useLiveReviewForm } from '../model/useLiveReviewForm';
import { BasicInfoSection } from './BasicInfoSection';
import { ContentSection } from './ContentSection';
import { ImageUploadSection } from './ImageUploadSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { CreateLiveReviewRequest } from '../api/entities/types';

export function LiveReviewAddPage() {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const { data: medicalSpecialties } = useMedicalSpecialties();
  const { data: hospitalsData } = useHospitals({ limit: 10000 });
  const createLiveReviewMutation = useCreateLiveReview();
  const [createdLiveReviewId, setCreatedLiveReviewId] = useState<string | null>(null);

  const {
    formData,
    errors,
    isDirty,
    updateField,
    updateNestedField,
    validateForm,
    hasErrors,
    resetForm,
  } = useLiveReviewForm();

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const createData: CreateLiveReviewRequest = {
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

      const result = await createLiveReviewMutation.mutateAsync(createData);
      setCreatedLiveReviewId(result.id);
      // 생생후기 생성 후 수정 페이지로 이동 (이미지 업로드를 위해)
      router.push(`/admin/live-reviews/${result.id}/edit`);
    } catch (error) {
      console.error('생생후기 생성 실패:', error);
    }
  };

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
        <h1 className='text-2xl font-bold'>생생후기 추가</h1>
      </div>

      <div className='flex justify-end gap-2'>
        <Button onClick={resetForm} variant='outline'>
          초기화
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isDirty || hasErrors || createLiveReviewMutation.isPending}
        >
          {createLiveReviewMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          생생후기 생성
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
      </div>
    </div>
  );
}
