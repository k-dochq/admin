// 의사 이미지 타입
export enum DoctorImageType {
  PROFILE = 'PROFILE',
  CAREER = 'CAREER',
}

// 의사 이미지 인터페이스
export interface DoctorImage {
  id: string;
  doctorId: string;
  imageType: DoctorImageType;
  imageUrl: string;
  alt: string | null;
  order: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 의사 이미지 업로드 요청 타입
export interface CreateDoctorImageRequest {
  imageType: DoctorImageType;
  imageUrl: string;
  path: string;
  alt?: string;
  order?: number;
}

// 의사 이미지 업로드 응답 타입
export interface CreateDoctorImageResponse {
  success: boolean;
  data?: DoctorImage;
  error?: string;
}

// 의사 이미지 삭제 응답 타입
export interface DeleteDoctorImageResponse {
  success: boolean;
  storagePath?: string;
  error?: string;
}

// 의사 이미지 타입별 제한 수
export const DOCTOR_IMAGE_TYPE_LIMITS: Record<DoctorImageType, number> = {
  [DoctorImageType.PROFILE]: 5,
  [DoctorImageType.CAREER]: 5,
};

// 의사 이미지 타입별 라벨
export const DOCTOR_IMAGE_TYPE_LABELS: Record<DoctorImageType, string> = {
  [DoctorImageType.PROFILE]: '프로필',
  [DoctorImageType.CAREER]: '경력',
};
