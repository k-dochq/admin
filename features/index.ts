// Features layer exports
export * from './admin-consultation-chat';
export * from './auth';
export * from './consultation-management';
export * from './dashboard';
export * from './doctor-edit';
export * from './doctor-management';
export * from './hospital-management';
export * from './navigation';

// 명시적 export로 중복 해결
export {
  HospitalEdit,
  HospitalEditForm,
  BasicInfoSection as HospitalBasicInfoSection,
  DetailInfoSection,
  AdditionalInfoSection,
  OpeningHoursForm,
  MedicalSpecialtySection,
  ImageUploadSection as HospitalImageUploadSection,
} from './hospital-edit';

export {
  ReviewManagement,
  ReviewDetailDialog,
  ReviewEditDialog,
  ReviewEditPage,
  BasicInfoSection as ReviewBasicInfoSection,
  ContentSection,
  ImageUploadSection as ReviewImageUploadSection,
} from './review-management';
