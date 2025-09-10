'use client';

import { useState, useCallback, useEffect } from 'react';
import { type DoctorFormData, type DoctorFormErrors, doctorToFormData } from './types';
import { type DoctorForList } from '@/features/doctor-management/api/entities/types';

export function useDoctorForm(initialDoctor?: DoctorForList) {
  const [formData, setFormData] = useState<DoctorFormData>(() => doctorToFormData(initialDoctor));
  const [errors, setErrors] = useState<DoctorFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // 초기 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialDoctor) {
      setFormData(doctorToFormData(initialDoctor));
      setIsDirty(false);
    }
  }, [initialDoctor]);

  // 필드 업데이트
  const updateField = useCallback(
    <K extends keyof DoctorFormData>(field: K, value: DoctorFormData[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setIsDirty(true);

      // 해당 필드의 에러 제거
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors],
  );

  // 중첩된 필드 업데이트 (LocalizedText)
  const updateNestedField = useCallback(
    <K extends keyof DoctorFormData>(field: K, nestedField: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field] as Record<string, unknown>),
          [nestedField]: value,
        },
      }));
      setIsDirty(true);

      // 해당 필드의 에러 제거
      const errorKey = `${String(field)}.${nestedField}` as keyof DoctorFormErrors;
      if (errors[errorKey]) {
        setErrors((prev) => ({
          ...prev,
          [errorKey]: undefined,
        }));
      }
    },
    [errors],
  );

  // 폼 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: DoctorFormErrors = {};

    // 이름 검증 (한국어는 필수)
    if (!formData.name.ko_KR?.trim()) {
      newErrors['name.ko_KR'] = '한국어 이름은 필수입니다.';
    }

    // 성별 검증
    if (!formData.genderType) {
      newErrors.genderType = '성별을 선택해주세요.';
    }

    // 병원 검증
    if (!formData.hospitalId) {
      newErrors.hospitalId = '병원을 선택해주세요.';
    }

    // 면허번호 검증 (선택사항이지만 입력된 경우 형식 검증)
    if (formData.licenseNumber && formData.licenseNumber.trim().length < 3) {
      newErrors.licenseNumber = '면허번호는 3자 이상이어야 합니다.';
    }

    // 순서 검증 (양수여야 함)
    if (formData.order !== undefined && formData.order < 0) {
      newErrors.order = '순서는 0 이상이어야 합니다.';
    }

    // 시술부위 검증 (선택사항)
    // 현재는 필수가 아니므로 별도 검증 없음

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 에러 여부 확인
  const hasErrors = Object.values(errors).some((error) => !!error);

  return {
    formData,
    errors,
    isDirty,
    hasErrors,
    updateField,
    updateNestedField,
    validateForm,
  };
}
