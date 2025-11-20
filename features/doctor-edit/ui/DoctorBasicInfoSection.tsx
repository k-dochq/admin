'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DoctorFormData, type DoctorFormErrors } from '../model/types';
import { type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { DoctorNameField } from './DoctorNameField';
import { DoctorPositionField } from './DoctorPositionField';
import { DoctorCareerField } from './DoctorCareerField';
import { DoctorGenderField } from './DoctorGenderField';
import { DoctorDescriptionField } from './DoctorDescriptionField';
import { DoctorLicenseSection } from './DoctorLicenseSection';
import { DoctorAdditionalSettings } from './DoctorAdditionalSettings';

interface DoctorBasicInfoSectionProps {
  formData: DoctorFormData;
  errors: DoctorFormErrors;
  selectedLocale: HospitalLocale;
  onUpdateField: <K extends keyof DoctorFormData>(field: K, value: DoctorFormData[K]) => void;
  onUpdateNestedField: <K extends keyof DoctorFormData>(
    field: K,
    nestedField: string,
    value: string,
  ) => void;
  isEditMode: boolean;
}

export function DoctorBasicInfoSection({
  formData,
  errors,
  selectedLocale,
  onUpdateField,
  onUpdateNestedField,
  isEditMode,
}: DoctorBasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 이름 (다국어) */}
        <DoctorNameField
          name={formData.name}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdate={(locale, value) => onUpdateNestedField('name', locale, value)}
        />

        {/* 직책 (다국어) */}
        <DoctorPositionField
          position={formData.position}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdate={(locale, value) => onUpdateNestedField('position', locale, value)}
        />

        {/* 성별 */}
        <DoctorGenderField
          genderType={formData.genderType}
          errors={errors}
          onUpdate={(value) => onUpdateField('genderType', value)}
        />

        {/* 설명 */}
        <DoctorDescriptionField
          description={formData.description}
          errors={errors}
          onUpdate={(value) => onUpdateField('description', value)}
        />

        {/* 경력정보 (다국어) */}
        <DoctorCareerField
          career={formData.career}
          errors={errors}
          selectedLocale={selectedLocale}
          onUpdate={(locale, value) => onUpdateNestedField('career', locale, value)}
        />

        {/* 면허 정보 */}
        <DoctorLicenseSection
          licenseNumber={formData.licenseNumber}
          licenseDate={formData.licenseDate}
          errors={errors}
          onUpdateLicenseNumber={(value) => onUpdateField('licenseNumber', value)}
          onUpdateLicenseDate={(date) => onUpdateField('licenseDate', date)}
        />

        {/* 기타 설정 (수정 모드에서만) */}
        {isEditMode && (
          <DoctorAdditionalSettings
            order={formData.order}
            stop={formData.stop}
            approvalStatusType={formData.approvalStatusType}
            errors={errors}
            onUpdateOrder={(value) => onUpdateField('order', value)}
            onUpdateStop={(value) => onUpdateField('stop', value)}
            onUpdateApprovalStatusType={(value) => onUpdateField('approvalStatusType', value)}
          />
        )}
      </CardContent>
    </Card>
  );
}
