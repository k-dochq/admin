'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { useDoctorById, useCreateDoctor, useUpdateDoctor } from '@/lib/queries/doctors';
import { LoadingSpinner } from '@/shared/ui';
import { useDoctorForm } from '../model/useDoctorForm';
import { DoctorBasicInfoSection } from './DoctorBasicInfoSection';
import { DoctorHospitalSection } from './DoctorHospitalSection';
import {
  type CreateDoctorRequest,
  type UpdateDoctorRequest,
} from '@/features/doctor-management/api/entities/types';
import {
  invalidateDoctorsCache,
  invalidateDoctorCache,
} from '@/features/doctor-management/api/utils/cache-invalidation';

interface DoctorFormProps {
  mode: 'add' | 'edit';
  doctorId?: string;
}

export function DoctorForm({ mode, doctorId }: DoctorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = mode === 'edit';

  // 수정 모드일 때만 의사 데이터 조회
  const { data, isLoading, error } = useDoctorById(isEditMode && doctorId ? doctorId : '');

  const createDoctorMutation = useCreateDoctor();
  const updateDoctorMutation = useUpdateDoctor();

  const { formData, errors, isDirty, updateField, updateNestedField, validateForm, hasErrors } =
    useDoctorForm(isEditMode ? data?.doctor : undefined);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && doctorId) {
        // 수정 모드
        const updateData: UpdateDoctorRequest = {
          id: doctorId,
          name: formData.name,
          position: formData.position,
          description: formData.description,
          genderType: formData.genderType,
          licenseNumber: formData.licenseNumber || undefined,
          licenseDate: formData.licenseDate,
          hospitalId: formData.hospitalId,
          order: formData.order,
          stop: formData.stop,
          approvalStatusType: formData.approvalStatusType,
        };

        updateDoctorMutation.mutate(updateData, {
          onSuccess: () => {
            // 캐시 무효화 수행
            invalidateDoctorsCache(queryClient);
            invalidateDoctorCache(queryClient, updateData.id);

            router.push('/admin/doctors');
          },
          onError: (error) => {
            console.error('의사 수정 실패:', error);
          },
        });
      } else {
        // 추가 모드
        const createData: CreateDoctorRequest = {
          name: formData.name,
          position: formData.position,
          description: formData.description,
          genderType: formData.genderType,
          licenseNumber: formData.licenseNumber || undefined,
          licenseDate: formData.licenseDate,
          hospitalId: formData.hospitalId,
          order: formData.order,
        };

        createDoctorMutation.mutate(createData, {
          onSuccess: () => {
            // 캐시 무효화 수행
            invalidateDoctorsCache(queryClient);

            router.push('/admin/doctors');
          },
          onError: (error) => {
            console.error('의사 생성 실패:', error);
          },
        });
      }
    } catch (error) {
      console.error(`의사 ${isEditMode ? '수정' : '생성'} 실패:`, error);
    }
  };

  const isSubmitting = isEditMode ? updateDoctorMutation.isPending : createDoctorMutation.isPending;

  // 수정 모드에서 로딩 중
  if (isEditMode && isLoading) {
    return <LoadingSpinner text='의사 정보를 불러오는 중...' />;
  }

  // 수정 모드에서 에러 발생
  if (isEditMode && error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>의사 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button onClick={() => router.push('/admin/doctors')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 수정 모드에서 의사 데이터가 없음
  if (isEditMode && !data?.doctor) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>의사를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/doctors')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? '의사 정보 수정' : '의사 추가';
  const submitButtonText = isEditMode ? '저장' : '생성';
  const submitIcon = isEditMode ? Save : Plus;

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/doctors')}
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

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 기본 정보 */}
        <DoctorBasicInfoSection
          formData={formData}
          errors={errors}
          onUpdateField={updateField}
          onUpdateNestedField={updateNestedField}
          isEditMode={isEditMode}
        />

        {/* 병원 정보 */}
        <DoctorHospitalSection
          hospitalId={formData.hospitalId}
          errors={errors}
          onUpdateHospitalId={(value: string) => updateField('hospitalId', value)}
        />
      </div>
    </div>
  );
}
