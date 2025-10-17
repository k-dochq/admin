import { useState, useEffect } from 'react';
import { type NoticeWithFiles, type LocalizedText, getLocalizedTextValue } from '../api';

export type { LocalizedText };

export interface NoticeFormData {
  title: LocalizedText;
  content: LocalizedText;
  isActive: boolean;
}

export interface NoticeFormErrors {
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
  isActive?: string;
}

const getLocalizedText = (value: unknown, locale: keyof LocalizedText): string => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return getLocalizedTextValue(value, locale);
  }
  return '';
};

export function useNoticeForm(notice?: NoticeWithFiles) {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: { ko_KR: '', en_US: '', th_TH: '' },
    content: { ko_KR: '', en_US: '', th_TH: '' },
    isActive: true,
  });

  const [errors, setErrors] = useState<NoticeFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // 공지사항 데이터로 폼 초기화
  useEffect(() => {
    if (notice) {
      setFormData({
        title: {
          ko_KR: getLocalizedText(notice.title, 'ko_KR'),
          en_US: getLocalizedText(notice.title, 'en_US'),
          th_TH: getLocalizedText(notice.title, 'th_TH'),
        },
        content: {
          ko_KR: getLocalizedText(notice.content, 'ko_KR'),
          en_US: getLocalizedText(notice.content, 'en_US'),
          th_TH: getLocalizedText(notice.content, 'th_TH'),
        },
        isActive: notice.isActive,
      });
      setIsDirty(false);
    }
  }, [notice]);

  // 중첩 필드 업데이트 (타입 안전한 버전)
  const updateNestedField = <T extends 'title' | 'content'>(
    field: T,
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

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: NoticeFormErrors = {};

    // 제목 검증
    if (!formData.title.ko_KR && !formData.title.en_US && !formData.title.th_TH) {
      newErrors.title = {
        ko_KR: '최소 하나의 언어로 제목을 입력해주세요.',
      };
    }

    // 내용 검증
    if (!formData.content.ko_KR && !formData.content.en_US && !formData.content.th_TH) {
      newErrors.content = {
        ko_KR: '최소 하나의 언어로 내용을 입력해주세요.',
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
    updateNestedField,
    validateForm,
    hasErrors,
  };
}
