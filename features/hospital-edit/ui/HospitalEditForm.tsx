'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useHospitalById, useUpdateHospital } from '@/lib/queries/hospital-edit';
import { useDistricts } from '@/lib/queries/districts';
import {
  type UpdateHospitalRequest,
  type DistrictForForm,
  parseJsonValueToString,
} from '@/features/hospital-edit/api';
import { LoadingSpinner } from '@/shared/ui';
import { useHospitalForm } from '../model/useHospitalForm';
import { BasicInfoSection } from './BasicInfoSection';
import { DetailInfoSection } from './DetailInfoSection';
import { AdditionalInfoSection } from './AdditionalInfoSection';
import { OpeningHoursForm } from './OpeningHoursForm';
import { MedicalSpecialtySection } from './MedicalSpecialtySection';

interface HospitalEditFormProps {
  hospitalId: string;
}

export function HospitalEditForm({ hospitalId }: HospitalEditFormProps) {
  const router = useRouter();
  const { data, isLoading, error } = useHospitalById(hospitalId);
  const { data: districtsData, isLoading: isLoadingDistricts } = useDistricts();
  const districts: DistrictForForm[] =
    districtsData?.map((d) => ({
      id: d.id,
      name: parseJsonValueToString(d.name),
      countryCode: d.countryCode,
    })) || [];
  const updateHospitalMutation = useUpdateHospital();

  const { formData, errors, isDirty, updateField, updateNestedField, validateForm, hasErrors } =
    useHospitalForm(data?.hospital);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
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
        ranking: formData.ranking,
        discountRate: formData.discountRate,
        districtId: formData.districtId,
        medicalSpecialtyIds: formData.medicalSpecialtyIds,
        prices: formData.prices,
        detailedOpeningHours: formData.detailedOpeningHours,
      };

      await updateHospitalMutation.mutateAsync(updateData);
      router.push('/admin/hospitals');
    } catch (error) {
      console.error('병원 정보 업데이트 실패:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text='병원 정보를 불러오는 중...' />;
  }

  if (error) {
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

  if (!data?.hospital) {
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
        <h1 className='text-2xl font-bold'>병원 정보 수정</h1>
      </div>

      <div className='flex justify-end'>
        <Button
          onClick={handleSubmit}
          disabled={!isDirty || hasErrors || updateHospitalMutation.isPending}
        >
          {updateHospitalMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          저장
        </Button>
      </div>

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 기본 정보 */}
        <BasicInfoSection
          name={formData.name}
          address={formData.address}
          phoneNumber={formData.phoneNumber}
          email={formData.email}
          errors={errors}
          onUpdateName={(field, value) => updateNestedField('name', field, value)}
          onUpdateAddress={(field, value) => updateNestedField('address', field, value)}
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
          onUpdateDirections={(field, value) => updateNestedField('directions', field, value)}
          onUpdateDescription={(field, value) => updateNestedField('description', field, value)}
          onUpdateOpeningHours={(field, value) => updateNestedField('openingHours', field, value)}
          onUpdateMemo={(value) => updateField('memo', value)}
        />

        {/* 기타 정보 */}
        <AdditionalInfoSection
          ranking={formData.ranking}
          discountRate={formData.discountRate}
          districtId={formData.districtId}
          prices={formData.prices}
          districts={districts}
          isLoadingDistricts={isLoadingDistricts}
          errors={errors}
          onUpdateRanking={(value) => updateField('ranking', value)}
          onUpdateDiscountRate={(value) => updateField('discountRate', value)}
          onUpdateDistrictId={(value) => updateField('districtId', value)}
          onUpdatePrices={(value) => updateField('prices', value)}
        />

        {/* 진료부위 */}
        <MedicalSpecialtySection
          selectedIds={formData.medicalSpecialtyIds}
          onChange={(selectedIds) => updateField('medicalSpecialtyIds', selectedIds)}
          errors={errors}
        />

        {/* 상세 진료시간 */}
        <OpeningHoursForm
          value={formData.detailedOpeningHours || {}}
          onChange={(value) => updateField('detailedOpeningHours', value)}
        />
      </div>
    </div>
  );
}
