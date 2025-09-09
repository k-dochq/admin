import {
  type HospitalFormData,
  type FormErrors,
  type LocalizedText,
  type PriceInfo,
} from '../api/entities/types';

export const validateLocalizedText = (
  text: LocalizedText,
  fieldName: string,
  isRequired = false,
): Partial<FormErrors> => {
  const errors: Partial<FormErrors> = {};

  if (isRequired) {
    if (!text.ko_KR?.trim()) {
      errors[`${fieldName}.ko_KR` as keyof FormErrors] = '한국어는 필수입니다.';
    }
    if (!text.en_US?.trim()) {
      errors[`${fieldName}.en_US` as keyof FormErrors] = '영어는 필수입니다.';
    }
    if (!text.th_TH?.trim()) {
      errors[`${fieldName}.th_TH` as keyof FormErrors] = '태국어는 필수입니다.';
    }
  }

  return errors;
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }

  return null;
};

export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) return '전화번호는 필수입니다.';

  const phoneRegex = /^[\d\-\+\(\)\s]+$/;
  if (!phoneRegex.test(phoneNumber)) {
    return '올바른 전화번호 형식이 아닙니다.';
  }

  return null;
};

export const validateRanking = (ranking: number | undefined): string | null => {
  if (ranking === undefined) return null;

  if (ranking < 1 || ranking > 100) {
    return '랭킹은 1-100 사이의 숫자여야 합니다.';
  }

  return null;
};

export const validateDiscountRate = (discountRate: number | undefined): string | null => {
  if (discountRate === undefined) return null;

  if (discountRate < 0 || discountRate > 100) {
    return '할인율은 0-100 사이의 숫자여야 합니다.';
  }

  return null;
};

export const validatePrices = (prices: PriceInfo | undefined): Partial<FormErrors> => {
  const errors: Partial<FormErrors> = {};

  if (!prices) return errors;

  if (prices.minPrice !== undefined && prices.minPrice < 0) {
    errors['prices.minPrice'] = '최소 가격은 0 이상이어야 합니다.';
  }

  if (prices.maxPrice !== undefined && prices.maxPrice < 0) {
    errors['prices.maxPrice'] = '최대 가격은 0 이상이어야 합니다.';
  }

  if (
    prices.minPrice !== undefined &&
    prices.maxPrice !== undefined &&
    prices.minPrice > prices.maxPrice
  ) {
    errors['prices.maxPrice'] = '최대 가격은 최소 가격보다 커야 합니다.';
  }

  return errors;
};

export const validateHospitalForm = (formData: HospitalFormData): FormErrors => {
  const errors: FormErrors = {};

  // 이름 검증 (필수)
  Object.assign(errors, validateLocalizedText(formData.name, 'name', true));

  // 주소 검증 (필수)
  Object.assign(errors, validateLocalizedText(formData.address, 'address', true));

  // 길찾기 검증 (선택)
  Object.assign(errors, validateLocalizedText(formData.directions, 'directions', false));

  // 설명 검증 (선택)
  Object.assign(errors, validateLocalizedText(formData.description, 'description', false));

  // 진료시간 검증 (선택)
  Object.assign(errors, validateLocalizedText(formData.openingHours, 'openingHours', false));

  // 전화번호 검증
  const phoneError = validatePhoneNumber(formData.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  // 이메일 검증
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  // 랭킹 검증
  const rankingError = validateRanking(formData.ranking);
  if (rankingError) {
    errors.ranking = rankingError;
  }

  // 할인율 검증
  const discountRateError = validateDiscountRate(formData.discountRate);
  if (discountRateError) {
    errors.discountRate = discountRateError;
  }

  // 가격 검증
  Object.assign(errors, validatePrices(formData.prices));

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(
    (error) => error !== undefined && error !== null && error !== '',
  );
};
