'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useCreateReview } from '@/lib/queries/reviews';
import { useReviewAddForm } from '../model/useReviewAddForm';
import { UserSelectionSection } from './UserSelectionSection';
import { BasicInfoSection } from './BasicInfoSection';
import { ContentSection } from './ContentSection';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import type { CreateReviewRequest } from '../api/entities/types';
import type { UserRoleType, UserGenderType, UserLocale, UserStatusType } from '@prisma/client';

type UserData = {
  name?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  drRoleType?: UserRoleType;
  genderType?: UserGenderType;
  locale?: UserLocale;
  age?: number;
  userStatusType?: UserStatusType;
  advertPush?: boolean;
  communityAlarm?: boolean;
  postAlarm?: boolean;
  collectPersonalInfo?: boolean;
  profileImgUrl?: string;
} | null;

export function ReviewAddPage() {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');
  const { data: medicalSpecialties } = useMedicalSpecialties();
  const { data: hospitalsData } = useHospitals({ limit: 200 });
  const createReviewMutation = useCreateReview();

  const {
    formData,
    errors,
    isDirty,
    updateField,
    updateNestedField,
    validateForm,
    hasErrors,
    resetForm,
  } = useReviewAddForm();

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const createData: CreateReviewRequest = {
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        concernsMultilingual: formData.concernsMultilingual,
        isRecommended: formData.isRecommended,
        medicalSpecialtyId: formData.medicalSpecialtyId,
        hospitalId: formData.hospitalId,
        userId: formData.userId,
        userData: formData.userData,
      };

      await createReviewMutation.mutateAsync(createData);
      // 리뷰 생성 후 목록으로 이동
      router.push('/admin/reviews');
    } catch (error) {
      console.error('리뷰 생성 실패:', error);
    }
  };

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
        <h1 className='text-2xl font-bold'>리뷰 추가</h1>
      </div>

      <div className='flex justify-end gap-2'>
        <Button onClick={resetForm} variant='outline'>
          초기화
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isDirty || hasErrors || createReviewMutation.isPending}
        >
          {createReviewMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          리뷰 생성
        </Button>
      </div>

      {/* 언어 선택 */}
      <div className='flex justify-center'>
        <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />
      </div>

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 사용자 선택 섹션 */}
        <UserSelectionSection
          userId={formData.userId}
          userData={formData.userData}
          errors={errors}
          onUpdateUserId={(value: string) => updateField('userId', value)}
          onUpdateUserData={(value: UserData) => updateField('userData', value)}
        />

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
      </div>
    </div>
  );
}
