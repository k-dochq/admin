import { type DoctorForList } from '@/features/doctor-management/api/entities/types';
import { type LocalizedText } from '@/shared/lib/types/locale';

export type { LocalizedText };

export type DoctorFormData = {
  // 기본 정보
  name: LocalizedText;
  position: LocalizedText;
  description: string;
  career: LocalizedText;
  genderType: 'MALE' | 'FEMALE';

  // 면허 정보
  licenseNumber: string;
  licenseDate: Date | undefined;

  // 병원 정보
  hospitalId: string;

  // 시술부위
  medicalSpecialtyIds: string[];

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
  'name.zh_TW'?: string;
  'name.ja_JP'?: string;
  'position.ko_KR'?: string;
  'position.en_US'?: string;
  'position.th_TH'?: string;
  'position.zh_TW'?: string;
  'position.ja_JP'?: string;
  'career.ko_KR'?: string;
  'career.en_US'?: string;
  'career.th_TH'?: string;
  'career.zh_TW'?: string;
  'career.ja_JP'?: string;
};

// 의사 데이터를 폼 데이터로 변환하는 함수
export function doctorToFormData(doctor?: DoctorForList): DoctorFormData {
  return {
    name: doctor?.name || { ko_KR: '', en_US: '', th_TH: '', zh_TW: '', ja_JP: '' },
    position: doctor?.position || { ko_KR: '', en_US: '', th_TH: '', zh_TW: '', ja_JP: '' },
    description: doctor?.description || '',
    career: doctor?.career || { ko_KR: '', en_US: '', th_TH: '', zh_TW: '', ja_JP: '' },
    genderType: doctor?.genderType || 'MALE',
    licenseNumber: doctor?.licenseNumber || '',
    licenseDate: doctor?.licenseDate ? new Date(doctor.licenseDate) : undefined,
    hospitalId: doctor?.hospitalId || '',
    medicalSpecialtyIds: doctor?.doctorSpecialties?.map((ds) => ds.medicalSpecialtyId) || [],
    order: doctor?.order,
    stop: doctor?.stop || false,
    approvalStatusType: doctor?.approvalStatusType || 'PENDING',
  };
}
