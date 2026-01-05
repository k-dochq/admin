'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useReviewById, useUpdateReview } from '@/lib/queries/reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useReviewForm } from '../model/useReviewForm';
import { BasicInfoSection } from '@/features/review-management/ui/BasicInfoSection';
import { ContentSection } from '@/features/review-management/ui/ContentSection';
import { ImageUploadSection } from '@/features/review-management/ui/ImageUploadSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { UpdateReviewRequest } from '../api/entities/types';

interface ReviewEditPageProps {
  reviewId: string;
}

export function ReviewEditPage({ reviewId }: ReviewEditPageProps) {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const { data: review, isLoading, error } = useReviewById(reviewId, true);
  const { data: medicalSpecialties } = useMedicalSpecialties();
  const { data: hospitalsData } = useHospitals({ limit: 10000 });
  const updateReviewMutation = useUpdateReview();

  const { formData, errors, isDirty, updateField, updateNestedField, validateForm, hasErrors } =
    useReviewForm(review);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: UpdateReviewRequest = {
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        concernsMultilingual: formData.concernsMultilingual,
        isRecommended: formData.isRecommended,
        medicalSpecialtyId: formData.medicalSpecialtyId,
        hospitalId: formData.hospitalId,
      };

      await updateReviewMutation.mutateAsync({
        id: reviewId,
        data: updateData,
      });
      router.push('/admin/reviews');
    } catch (error) {
      console.error('리뷰 정보 업데이트 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text='리뷰 정보를 불러오는 중...' />;
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>리뷰 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => router.push('/admin/reviews')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>리뷰를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/reviews')} variant='outline'>
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
          onClick={() => router.push('/admin/reviews')}
          className='flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
        <h1 className='text-2xl font-bold'>리뷰 수정</h1>
      </div>

      <div className='flex justify-end'>
        <Button
          onClick={handleSubmit}
          disabled={!isDirty || hasErrors || updateReviewMutation.isPending}
        >
          {updateReviewMutation.isPending ? (
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
          rating={formData.rating}
          medicalSpecialtyId={formData.medicalSpecialtyId}
          hospitalId={formData.hospitalId}
          isRecommended={formData.isRecommended}
          medicalSpecialties={medicalSpecialties || []}
          hospitals={hospitalsData?.hospitals || []}
          errors={errors}
          onUpdateRating={(value: number) => updateField('rating', value)}
          onUpdateMedicalSpecialtyId={(value: string) => updateField('medicalSpecialtyId', value)}
          onUpdateHospitalId={(value: string) => updateField('hospitalId', value)}
          onUpdateIsRecommended={(value: boolean) => updateField('isRecommended', value)}
        />

        {/* 내용 섹션 */}
        <ContentSection
          title={formData.title}
          content={formData.content}
          concernsMultilingual={formData.concernsMultilingual}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdateTitle={(field, value) => updateNestedField('title', field, value)}
          onUpdateContent={(field, value) => updateNestedField('content', field, value)}
          onUpdateConcernsMultilingual={(field, value) =>
            updateNestedField('concernsMultilingual', field, value)
          }
        />

        {/* 리뷰 이미지 */}
        <ImageUploadSection reviewId={reviewId} />
      </div>
    </div>
  );
}
