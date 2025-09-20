import { useState, useEffect } from 'react';
import { Prisma } from '@prisma/client';
import type { ReviewDetail } from '../api/entities/types';

export interface ReviewFormData {
  rating: number;
  title: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  concernsMultilingual: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  isRecommended: boolean;
  medicalSpecialtyId: string;
  hospitalId: string;
}

export interface ReviewFormErrors {
  rating?: string;
  title?: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  content?: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  concernsMultilingual?: {
    ko_KR?: string;
    en_US?: string;
    th_TH?: string;
  };
  medicalSpecialtyId?: string;
  hospitalId?: string;
  isRecommended?: string;
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

export function useReviewForm(review?: ReviewDetail) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: { ko_KR: '', en_US: '', th_TH: '' },
    content: { ko_KR: '', en_US: '', th_TH: '' },
    concernsMultilingual: { ko_KR: '', en_US: '', th_TH: '' },
    isRecommended: true,
    medicalSpecialtyId: '',
    hospitalId: '',
  });

  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // 리뷰 데이터로 폼 초기화
  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating,
        title: {
          ko_KR: getLocalizedText(review.title, 'ko_KR'),
          en_US: getLocalizedText(review.title, 'en_US'),
          th_TH: getLocalizedText(review.title, 'th_TH'),
        },
        content: {
          ko_KR: getLocalizedText(review.content, 'ko_KR'),
          en_US: getLocalizedText(review.content, 'en_US'),
          th_TH: getLocalizedText(review.content, 'th_TH'),
        },
        concernsMultilingual: {
          ko_KR: getLocalizedText(review.concernsMultilingual, 'ko_KR') || review.concerns || '',
          en_US: getLocalizedText(review.concernsMultilingual, 'en_US'),
          th_TH: getLocalizedText(review.concernsMultilingual, 'th_TH'),
        },
        isRecommended: review.isRecommended,
        medicalSpecialtyId: review.medicalSpecialtyId,
        hospitalId: review.hospitalId,
      });
      setIsDirty(false);
    }
  }, [review]);

  // 필드 업데이트
  const updateField = (field: keyof ReviewFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // 중첩 필드 업데이트
  const updateNestedField = (field: keyof ReviewFormData, subField: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [subField]: value,
      },
    }));
    setIsDirty(true);
    // 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        delete (newErrors[field] as any)[subField];
      }
      return newErrors;
    });
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: ReviewFormErrors = {};

    // 평점 검증
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = '평점은 1-5 사이여야 합니다.';
    }

    // 시술부위 검증
    if (!formData.medicalSpecialtyId) {
      newErrors.medicalSpecialtyId = '시술부위를 선택해주세요.';
    }

    // 병원 검증
    if (!formData.hospitalId) {
      newErrors.hospitalId = '병원을 선택해주세요.';
    }

    // 제목 검증 (한국어는 필수)
    if (!formData.title.ko_KR.trim()) {
      newErrors.title = { ...newErrors.title, ko_KR: '한국어 제목은 필수입니다.' };
    }

    // 내용 검증 (한국어는 필수)
    if (!formData.content.ko_KR.trim()) {
      newErrors.content = { ...newErrors.content, ko_KR: '한국어 내용은 필수입니다.' };
    }

    // 고민부위 검증 (한국어는 필수)
    if (!formData.concernsMultilingual.ko_KR.trim()) {
      newErrors.concernsMultilingual = {
        ...newErrors.concernsMultilingual,
        ko_KR: '한국어 고민부위는 필수입니다.',
      };
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
  };
}
