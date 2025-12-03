import { useState, useEffect } from 'react';
import { Prisma } from '@prisma/client';
import type { LiveReviewDetail } from '../api/entities/types';

export interface LiveReviewFormData {
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  detailLink: string;
  order: number | null;
  isActive: boolean;
  medicalSpecialtyId: string;
  hospitalId: string;
}

export interface LiveReviewFormErrors {
  content?: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  medicalSpecialtyId?: string;
  hospitalId?: string;
  detailLink?: string;
  order?: string;
}

// 다국어 텍스트 추출
const getLocalizedText = (
  jsonText: Prisma.JsonValue | null | undefined,
  locale: string,
): string => {
  if (!jsonText) return '';
  if (typeof jsonText === 'string') return jsonText;
  if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
    const textObj = jsonText as Record<string, unknown>;
    return (textObj[locale] as string) || '';
  }
  return '';
};

export function useLiveReviewForm(liveReview?: LiveReviewDetail | null) {
  const [formData, setFormData] = useState<LiveReviewFormData>({
    content: { ko_KR: '', en_US: '', th_TH: '' },
    detailLink: '',
    order: null,
    isActive: true,
    medicalSpecialtyId: '',
    hospitalId: '',
  });

  const [errors, setErrors] = useState<LiveReviewFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // 생생후기 데이터로 폼 초기화
  useEffect(() => {
    if (liveReview) {
      setFormData({
        content: {
          ko_KR: getLocalizedText(liveReview.content, 'ko_KR'),
          en_US: getLocalizedText(liveReview.content, 'en_US'),
          th_TH: getLocalizedText(liveReview.content, 'th_TH'),
        },
        detailLink: liveReview.detailLink || '',
        order: liveReview.order,
        isActive: liveReview.isActive,
        medicalSpecialtyId: liveReview.medicalSpecialtyId,
        hospitalId: liveReview.hospitalId,
      });
      setIsDirty(false);
    }
  }, [liveReview]);

  // 필드 업데이트
  const updateField = <K extends keyof LiveReviewFormData>(
    field: K,
    value: LiveReviewFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (field in newErrors) {
        delete newErrors[field as keyof LiveReviewFormErrors];
      }
      return newErrors;
    });
  };

  // 중첩 필드 업데이트
  const updateNestedField = (
    field: 'content',
    subField: 'ko_KR' | 'en_US' | 'th_TH',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value,
      },
    }));
    setIsDirty(true);
    // 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        const fieldErrors = newErrors[field] as Record<string, string>;
        delete fieldErrors[subField];
      }
      return newErrors;
    });
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      content: { ko_KR: '', en_US: '', th_TH: '' },
      detailLink: '',
      order: null,
      isActive: true,
      medicalSpecialtyId: '',
      hospitalId: '',
    });
    setErrors({});
    setIsDirty(false);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: LiveReviewFormErrors = {};

    // 시술부위 검증
    if (!formData.medicalSpecialtyId) {
      newErrors.medicalSpecialtyId = '시술부위를 선택해주세요.';
    }

    // 병원 검증
    if (!formData.hospitalId) {
      newErrors.hospitalId = '병원을 선택해주세요.';
    }

    // 내용 검증 (한국어는 필수)
    if (!formData.content.ko_KR.trim()) {
      newErrors.content = { ...newErrors.content, ko_KR: '한국어 내용은 필수입니다.' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 에러가 있는지 확인
  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    errors,
    isDirty,
    updateField,
    updateNestedField,
    validateForm,
    hasErrors,
    resetForm,
  };
}
