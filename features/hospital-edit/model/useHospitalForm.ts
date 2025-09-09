'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  type HospitalFormData,
  type FormErrors,
  type LocalizedText,
  type HospitalForEdit,
  parseLocalizedText,
  parsePriceInfo,
  parseOpeningHoursInfo,
} from '../api/entities/types';
import { validateHospitalForm, hasFormErrors } from '../lib/validation';

const createEmptyLocalizedText = (): LocalizedText => ({
  ko_KR: '',
  en_US: '',
  th_TH: '',
});

const createInitialFormData = (): HospitalFormData => ({
  name: createEmptyLocalizedText(),
  address: createEmptyLocalizedText(),
  directions: createEmptyLocalizedText(),
  phoneNumber: '',
  email: '',
  description: createEmptyLocalizedText(),
  openingHours: createEmptyLocalizedText(),
  memo: '',
  ranking: undefined,
  discountRate: undefined,
  districtId: undefined,
  medicalSpecialtyIds: undefined,
  prices: undefined,
  detailedOpeningHours: undefined,
});

export const useHospitalForm = (initialHospital?: HospitalForEdit) => {
  const [formData, setFormData] = useState<HospitalFormData>(createInitialFormData());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<HospitalFormData>(createInitialFormData());

  // 병원 데이터로 폼 초기화
  const initializeForm = useCallback((hospital: HospitalForEdit) => {
    const name = parseLocalizedText(hospital.name);
    const address = parseLocalizedText(hospital.address);
    const directions = parseLocalizedText(hospital.directions);
    const description = parseLocalizedText(hospital.description);
    const openingHours = parseLocalizedText(hospital.openingHours);
    const prices = parsePriceInfo(hospital.prices);
    const detailedOpeningHours = parseOpeningHoursInfo(hospital.openingHours); // 추후 별도 필드로 변경

    const medicalSpecialtyIds =
      hospital.hospitalSpecialties?.map((ms) => ms.medicalSpecialtyId) ?? undefined;

    const data: HospitalFormData = {
      name,
      address,
      directions,
      phoneNumber: hospital.phoneNumber || '',
      email: hospital.email || '',
      description,
      openingHours,
      memo: hospital.memo || '',
      ranking: hospital.ranking ?? undefined,
      discountRate: hospital.discountRate ?? undefined,
      districtId: hospital.districtId ?? undefined,
      medicalSpecialtyIds,
      prices,
      detailedOpeningHours,
    };

    setFormData(data);
    setInitialData(data);
    setIsDirty(false);
    setErrors({});
  }, []);

  // 초기 데이터 설정
  useEffect(() => {
    if (initialHospital) {
      initializeForm(initialHospital);
    }
  }, [initialHospital, initializeForm]);

  // 필드 업데이트 함수
  const updateField = useCallback(
    <K extends keyof HospitalFormData>(field: K, value: HospitalFormData[K]) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Dirty 상태 체크
        const isDataDirty = JSON.stringify(newData) !== JSON.stringify(initialData);
        setIsDirty(isDataDirty);

        return newData;
      });

      // 해당 필드의 에러 제거
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors, initialData],
  );

  // 중첩된 객체 필드 업데이트 (LocalizedText 등)
  const updateNestedField = useCallback(
    <K extends 'name' | 'address' | 'directions' | 'description' | 'openingHours'>(
      field: K,
      nestedField: keyof LocalizedText,
      value: string,
    ) => {
      setFormData((prev) => {
        const currentValue = (prev[field] as LocalizedText) || ({} as LocalizedText);
        const newValue = { ...currentValue, [nestedField]: value };
        const newData = { ...prev, [field]: newValue };

        // Dirty 상태 체크
        const isDataDirty = JSON.stringify(newData) !== JSON.stringify(initialData);
        setIsDirty(isDataDirty);

        return newData;
      });

      // 해당 필드의 에러 제거
      const errorKey = `${String(field)}.${String(nestedField)}` as keyof FormErrors;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [errors, initialData],
  );

  // 폼 검증
  const validateForm = useCallback(() => {
    const newErrors = validateHospitalForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [formData]);

  // 폼 리셋
  const resetForm = useCallback(() => {
    if (initialHospital) {
      initializeForm(initialHospital);
    } else {
      const emptyData = createInitialFormData();
      setFormData(emptyData);
      setInitialData(emptyData);
      setIsDirty(false);
      setErrors({});
    }
  }, [initialHospital, initializeForm]);

  return {
    formData,
    errors,
    isDirty,
    updateField,
    updateNestedField,
    validateForm,
    resetForm,
    hasErrors: hasFormErrors(errors),
  };
};
