'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { useHospitalById, useUpdateHospital } from '@/lib/queries/hospital-edit';
import { useCreateHospital } from '@/lib/mutations/hospital-create';
import { useDistricts } from '@/lib/queries/districts';
import {
  type UpdateHospitalRequest,
  type CreateHospitalRequest,
  type DistrictForForm,
  parseJsonValueToString,
} from '@/features/hospital-edit/api';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalForm } from '../model/useHospitalForm';
import { BasicInfoSection } from './BasicInfoSection';
import { DetailInfoSection } from './DetailInfoSection';
import { AdditionalInfoSection } from './additional-info';
import { OpeningHoursForm } from './OpeningHoursForm';
import { MedicalSpecialtySection } from './MedicalSpecialtySection';
import { HospitalCategorySection } from './HospitalCategorySection';
import { BadgeSelector } from './BadgeSelector';
import { ImageUploadSection } from './image-upload';
import { AdditionalMediaSection } from './AdditionalMediaSection';
import { LanguageTabs, type HospitalLocale } from './LanguageTabs';

/** 공란(undefined)일 때 null로 보내 DB에 null 저장 */
function emptyToNull(value: number | undefined | null): number | null {
  return value === undefined || value === null ? null : value;
}

interface HospitalFormProps {
  mode: 'add' | 'edit';
  hospitalId?: string;
}

export function HospitalForm({ mode, hospitalId }: HospitalFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  const [selectedLocale, setSelectedLocale] = useState<HospitalLocale>('ko_KR');

  // 수정 모드일 때만 병원 데이터 조회
  const { data, isLoading, error } = useHospitalById(isEditMode && hospitalId ? hospitalId : '');

  const { data: districtsData, isLoading: isLoadingDistricts } = useDistricts();
  const districts: DistrictForForm[] =
    districtsData?.map((d) => ({
      id: d.id,
      name: parseJsonValueToString(d.name),
      countryCode: d.countryCode,
    })) || [];

  const createHospitalMutation = useCreateHospital();
  const updateHospitalMutation = useUpdateHospital();

  const { formData, errors, isDirty, updateField, updateNestedField, validateForm, hasErrors } =
    useHospitalForm(isEditMode ? data?.hospital : undefined);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && hospitalId) {
        // 수정 모드
        const updateData: UpdateHospitalRequest = {
          id: hospitalId,
          name: formData.name,
          address: formData.address,
          directions: formData.directions,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          description: formData.description,
          openingHours: formData.openingHours,
          memo: formData.memo,
          ranking: emptyToNull(formData.ranking),
          rating: emptyToNull(formData.rating),
          discountRate: emptyToNull(formData.discountRate),
          latitude: emptyToNull(formData.latitude),
          longitude: emptyToNull(formData.longitude),
          districtId: formData.districtId,
          medicalSpecialtyIds: formData.medicalSpecialtyIds,
          hospitalCategoryIds: formData.hospitalCategoryIds,
          prices: formData.prices,
          detailedOpeningHours: formData.detailedOpeningHours,
          displayLocationName: formData.displayLocationName,
          badge: formData.badge,
          recommendedRanking: emptyToNull(formData.recommendedRanking),
          approvalStatusType: formData.approvalStatusType,
          isActive: formData.exposureLevel === 'Public',
        };

        await updateHospitalMutation.mutateAsync(updateData);
      } else {
        // 추가 모드
        const createData: CreateHospitalRequest = {
          name: formData.name,
          address: formData.address,
          directions: formData.directions,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          description: formData.description,
          openingHours: formData.openingHours,
          memo: formData.memo,
          ranking: emptyToNull(formData.ranking),
          rating: emptyToNull(formData.rating),
          discountRate: emptyToNull(formData.discountRate),
          latitude: emptyToNull(formData.latitude),
          longitude: emptyToNull(formData.longitude),
          districtId: formData.districtId,
          medicalSpecialtyIds: formData.medicalSpecialtyIds,
          hospitalCategoryIds: formData.hospitalCategoryIds,
          prices: formData.prices,
          detailedOpeningHours: formData.detailedOpeningHours,
          displayLocationName: formData.displayLocationName,
          badge: formData.badge,
          recommendedRanking: emptyToNull(formData.recommendedRanking),
        };

        await createHospitalMutation.mutateAsync(createData);
      }

      router.push('/admin/hospitals');
    } catch (error) {
      console.error(`병원 ${isEditMode ? '수정' : '생성'} 실패:`, error);
    }
  };

  const isSubmitting = isEditMode
    ? updateHospitalMutation.isPending
    : createHospitalMutation.isPending;

  // 수정 모드에서 로딩 중
  if (isEditMode && isLoading) {
    return <LoadingSpinner text='병원 정보를 불러오는 중...' />;
  }

  // 수정 모드에서 에러 발생
  if (isEditMode && error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>병원 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => router.push('/admin/hospitals')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 수정 모드에서 병원 데이터가 없음
  if (isEditMode && !data?.hospital) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>병원을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/hospitals')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? '병원 정보 수정' : '병원 추가';
  const submitButtonText = isEditMode ? '저장' : '생성';
  const submitIcon = isEditMode ? Save : Plus;

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/hospitals')}
          className='flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
        <h1 className='text-2xl font-bold'>{pageTitle}</h1>
      </div>

      <div className='flex justify-end'>
        <Button
          onClick={handleSubmit}
          disabled={(!isDirty && isEditMode) || hasErrors || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            React.createElement(submitIcon, { className: 'mr-2 h-4 w-4' })
          )}
          {submitButtonText}
        </Button>
      </div>

      {/* 언어 선택 */}
      <div className='flex items-end justify-center'>
        <LanguageTabs value={selectedLocale} onValueChange={setSelectedLocale} />
      </div>

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 기본 정보 */}
        <BasicInfoSection
          name={formData.name}
          address={formData.address}
          displayLocationName={
            formData.displayLocationName || {
              ko_KR: '',
              en_US: '',
              th_TH: '',
              zh_TW: '',
              ja_JP: '',
              hi_IN: '',
            }
          }
          phoneNumber={formData.phoneNumber}
          email={formData.email}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdateName={(field, value) => updateNestedField('name', field, value)}
          onUpdateAddress={(field, value) => updateNestedField('address', field, value)}
          onUpdateDisplayLocationName={(field, value) =>
            updateNestedField('displayLocationName', field, value)
          }
          onUpdatePhoneNumber={(value) => updateField('phoneNumber', value)}
          onUpdateEmail={(value) => updateField('email', value)}
        />

        {/* 상세 정보 */}
        <DetailInfoSection
          directions={formData.directions}
          description={formData.description}
          openingHours={formData.openingHours}
          memo={formData.memo}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdateDirections={(field, value) => updateNestedField('directions', field, value)}
          onUpdateDescription={(field, value) => updateNestedField('description', field, value)}
          onUpdateOpeningHours={(field, value) => updateNestedField('openingHours', field, value)}
          onUpdateMemo={(value) => updateField('memo', value)}
        />

        {/* 기타 정보 */}
        <AdditionalInfoSection
          ranking={formData.ranking}
          rating={formData.rating}
          discountRate={formData.discountRate}
          latitude={formData.latitude}
          longitude={formData.longitude}
          districtId={formData.districtId}
          prices={formData.prices}
          districts={districts}
          isLoadingDistricts={isLoadingDistricts}
          errors={errors}
          onUpdateRanking={(value) => updateField('ranking', value)}
          onUpdateRating={(value) => updateField('rating', value)}
          onUpdateDiscountRate={(value) => updateField('discountRate', value)}
          onUpdateLatitude={(value) => updateField('latitude', value)}
          onUpdateLongitude={(value) => updateField('longitude', value)}
          onUpdateDistrictId={(value) => updateField('districtId', value)}
          onUpdatePrices={(value) => updateField('prices', value)}
          recommendedRanking={formData.recommendedRanking}
          onUpdateRecommendedRanking={(value) => updateField('recommendedRanking', value)}
          approvalStatusType={formData.approvalStatusType}
          onUpdateApprovalStatusType={(value) => updateField('approvalStatusType', value)}
          exposureLevel={formData.exposureLevel}
          onUpdateExposureLevel={(value) => updateField('exposureLevel', value)}
        />

        {/* 진료부위 */}
        <MedicalSpecialtySection
          selectedIds={formData.medicalSpecialtyIds}
          onChange={(selectedIds) => updateField('medicalSpecialtyIds', selectedIds)}
          errors={errors}
        />

        {/* 병원 카테고리 */}
        <HospitalCategorySection
          selectedIds={formData.hospitalCategoryIds}
          onChange={(selectedIds) => updateField('hospitalCategoryIds', selectedIds)}
          errors={errors}
        />

        {/* 뱃지 */}
        <BadgeSelector
          badges={formData.badge}
          onChange={(badges) => updateField('badge', badges)}
          errors={errors}
        />

        {/* 상세 진료시간 */}
        <OpeningHoursForm
          value={formData.detailedOpeningHours || {}}
          onChange={(value) => updateField('detailedOpeningHours', value)}
        />

        {/* 병원 이미지 - 수정 모드에서만 표시 */}
        {isEditMode && hospitalId && <ImageUploadSection hospitalId={hospitalId} />}

        {/* 기타 병원 이미지, 영상링크 - 수정 모드에서만 표시 */}
        {isEditMode && hospitalId && <AdditionalMediaSection hospitalId={hospitalId} />}
      </div>
    </div>
  );
}
