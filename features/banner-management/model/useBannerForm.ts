import { useState, useCallback } from 'react';
import { type CreateBannerRequest, type MultilingualTitle } from '@/features/banner-management/api';
import { type EventBannerType, type EventBannerLocale } from '@prisma/client';

export interface BannerFormData {
  title: MultilingualTitle;
  linkUrl: string;
  order: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  type?: EventBannerType;
}

export interface BannerFormErrors {
  title?: Partial<MultilingualTitle>;
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
    zh: '',
    ja: '',
    hi: '',
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
    if (!formData.title.zh.trim()) {
      newErrors.title = { ...newErrors.title, zh: '중국어 번체 제목은 필수입니다.' };
    }
    if (!formData.title.ja.trim()) {
      newErrors.title = { ...newErrors.title, ja: '일본어 제목은 필수입니다.' };
    }
    if (!formData.title.hi.trim()) {
      newErrors.title = { ...newErrors.title, hi: '힌디어 제목은 필수입니다.' };
    }

    // 링크 URL 검증 (선택사항이지만 입력된 경우 URL 형식 검증)
    if (formData.linkUrl.trim()) {
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
    (locale: EventBannerLocale, value: string) => {
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
    const trimmedLinkUrl = formData.linkUrl.trim();
    return {
      title: formData.title,
      // 빈 문자열이면 undefined로, 있으면 값으로 전달 (생성 시)
      // 업데이트 시에는 null로 설정하려면 호출하는 쪽에서 처리
      linkUrl: trimmedLinkUrl || undefined,
      order: formData.order,
      isActive: formData.isActive,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
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
