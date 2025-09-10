import { type DoctorForList } from '@/features/doctor-management/api/entities/types';

export type LocalizedText = {
  ko_KR?: string;
  en_US?: string;
  th_TH?: string;
};

export type DoctorFormData = {
  // 기본 정보
  name: LocalizedText;
  position: LocalizedText;
  description: string;
  genderType: 'MALE' | 'FEMALE';

  // 면허 정보
  licenseNumber: string;
  licenseDate: Date | undefined;

  // 병원 정보
  hospitalId: string;

  // 기타 정보
  order: number | undefined;
  stop: boolean;
  approvalStatusType: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_APPROVAL';
};

export type DoctorFormErrors = {
  [K in keyof DoctorFormData]?: string;
} & {
  // 중첩된 객체의 에러
  'name.ko_KR'?: string;
  'name.en_US'?: string;
  'name.th_TH'?: string;
  'position.ko_KR'?: string;
  'position.en_US'?: string;
  'position.th_TH'?: string;
};

// 의사 데이터를 폼 데이터로 변환하는 함수
export function doctorToFormData(doctor?: DoctorForList): DoctorFormData {
  return {
    name: doctor?.name || { ko_KR: '', en_US: '', th_TH: '' },
    position: doctor?.position || { ko_KR: '', en_US: '', th_TH: '' },
    description: doctor?.description || '',
    genderType: doctor?.genderType || 'MALE',
    licenseNumber: doctor?.licenseNumber || '',
    licenseDate: doctor?.licenseDate ? new Date(doctor.licenseDate) : undefined,
    hospitalId: doctor?.hospitalId || '',
    order: doctor?.order,
    stop: doctor?.stop || false,
    approvalStatusType: doctor?.approvalStatusType || 'PENDING',
  };
}
