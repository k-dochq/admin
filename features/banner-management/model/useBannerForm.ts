import { useState, useCallback } from 'react';
import { type CreateBannerRequest, type MultilingualTitle } from '@/features/banner-management/api';

export interface BannerFormData {
  title: MultilingualTitle;
  linkUrl: string;
  order: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface BannerFormErrors {
  title?: {
    ko?: string;
    en?: string;
    th?: string;
  };
  linkUrl?: string;
  order?: string;
  startDate?: string;
  endDate?: string;
}

const initialFormData: BannerFormData = {
  title: {
    ko: '',
    en: '',
    th: '',
  },
  linkUrl: '',
  order: 0,
  isActive: false,
  startDate: new Date(),
  endDate: undefined,
};

export function useBannerForm(initialData?: Partial<BannerFormData>) {
  const [formData, setFormData] = useState<BannerFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<BannerFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: BannerFormErrors = {};

    // 제목 검증
    if (!formData.title.ko.trim()) {
      newErrors.title = { ...newErrors.title, ko: '한국어 제목은 필수입니다.' };
    }
    if (!formData.title.en.trim()) {
      newErrors.title = { ...newErrors.title, en: '영어 제목은 필수입니다.' };
    }
    if (!formData.title.th.trim()) {
      newErrors.title = { ...newErrors.title, th: '태국어 제목은 필수입니다.' };
    }

    // 링크 URL 검증
    if (!formData.linkUrl.trim()) {
      newErrors.linkUrl = '링크 URL은 필수입니다.';
    } else {
      try {
        new URL(formData.linkUrl);
      } catch {
        newErrors.linkUrl = '올바른 URL 형식이 아닙니다.';
      }
    }

    // 순서 검증
    if (formData.order < 0) {
      newErrors.order = '순서는 0 이상이어야 합니다.';
    }

    // 날짜 검증
    if (!formData.startDate) {
      newErrors.startDate = '시작일은 필수입니다.';
    }

    if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = '종료일은 시작일보다 늦어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateFormData = useCallback(
    (updates: Partial<BannerFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));

      // 에러 초기화
      if (Object.keys(errors).length > 0) {
        setErrors({});
      }
    },
    [errors],
  );

  const updateTitle = useCallback(
    (locale: keyof MultilingualTitle, value: string) => {
      setFormData((prev) => ({
        ...prev,
        title: {
          ...prev.title,
          [locale]: value,
        },
      }));

      // 해당 언어 에러 초기화
      if (errors.title?.[locale]) {
        setErrors((prev) => ({
          ...prev,
          title: {
            ...prev.title,
            [locale]: undefined,
          },
        }));
      }
    },
    [errors.title],
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const getFormDataForSubmission = useCallback((): CreateBannerRequest => {
    return {
      title: formData.title,
      linkUrl: formData.linkUrl,
      order: formData.order,
      isActive: formData.isActive,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
  }, [formData]);

  return {
    formData,
    errors,
    updateFormData,
    updateTitle,
    validateForm,
    resetForm,
    getFormDataForSubmission,
  };
}
