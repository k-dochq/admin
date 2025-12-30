import { useState } from 'react';
import { Prisma, UserRoleType, UserGenderType, UserLocale, UserStatusType } from '@prisma/client';
import type { CreateUserRequest } from '@/lib/types/user';
import type { HospitalLocale, MultilingualField } from '@/features/hospital-edit/ui/LanguageTabs';

export interface ReviewAddFormData {
  rating: number;
  title: MultilingualField;
  content: MultilingualField;
  concernsMultilingual: MultilingualField;
  isRecommended: boolean;
  medicalSpecialtyId: string;
  hospitalId: string;
  userId: string;
  userData: {
    name?: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    drRoleType?: UserRoleType;
    genderType?: UserGenderType;
    locale?: UserLocale;
    age?: number;
    userStatusType?: UserStatusType;
    advertPush?: boolean;
    communityAlarm?: boolean;
    postAlarm?: boolean;
    collectPersonalInfo?: boolean;
    profileImgUrl?: string;
  } | null;
}

export interface ReviewAddFormErrors {
  rating?: string;
  title?: Partial<MultilingualField>;
  content?: Partial<MultilingualField>;
  concernsMultilingual?: Partial<MultilingualField>;
  medicalSpecialtyId?: string;
  hospitalId?: string;
  isRecommended?: string;
  userId?: string;
  userData?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export function useReviewAddForm() {
  const [formData, setFormData] = useState<ReviewAddFormData>({
    rating: 5,
    title: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
    content: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
    concernsMultilingual: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
    isRecommended: true,
    medicalSpecialtyId: '',
    hospitalId: '',
    userId: '',
    userData: null,
  });

  const [errors, setErrors] = useState<ReviewAddFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // 필드 업데이트
  const updateField = <K extends keyof ReviewAddFormData>(
    field: K,
    value: ReviewAddFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // 해당 필드의 에러 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // 중첩 필드 업데이트 (타입 안전한 버전)
  const updateNestedField = <T extends 'title' | 'content' | 'concernsMultilingual'>(
    field: T,
    subField: HospitalLocale,
    value: string,
  ): void => {
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
      rating: 5,
      title: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
      content: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
      concernsMultilingual: { ko_KR: '', en_US: '', th_TH: '', zh_TW: '' },
      isRecommended: true,
      medicalSpecialtyId: '',
      hospitalId: '',
      userId: '',
      userData: null,
    });
    setErrors({});
    setIsDirty(false);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: ReviewAddFormErrors = {};

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

    // 사용자 검증
    if (!formData.userId && !formData.userData) {
      newErrors.userId = '기존 사용자를 선택하거나 새 사용자 정보를 입력해주세요.';
    }

    // 새 사용자 정보 검증 (userData가 있는 경우)
    if (formData.userData) {
      if (!formData.userData.name?.trim()) {
        newErrors.userData = { ...newErrors.userData, name: '이름은 필수입니다.' };
      }
      if (!formData.userData.email?.trim()) {
        newErrors.userData = { ...newErrors.userData, email: '이메일은 필수입니다.' };
      } else {
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.userData.email)) {
          newErrors.userData = { ...newErrors.userData, email: '올바른 이메일 형식이 아닙니다.' };
        }
      }
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
    resetForm,
  };
}
