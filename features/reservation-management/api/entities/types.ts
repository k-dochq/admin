import { ReservationStatus, Prisma } from '@prisma/client';

// 예약 카테고리 타입
export type ReservationCategory = 'PROCEDURE' | 'LIMOUSINE' | 'OTHER';

// 예약 언어 타입
export type ReservationLanguage = 'ko_KR' | 'en_US' | 'th_TH';

// 예약 생성 요청 타입
export interface CreateReservationRequest {
  hospitalId: string;
  userId: string;
  category: ReservationCategory;
  language: ReservationLanguage;
  procedureName: string;
  reservationDate: string; // YYYY-MM-DD 형식
  reservationTime: string; // HH:MM 형식
  depositAmount: number; // 센트 단위 (1 USD = 100)
  currency: string; // 기본 'USD'
  paymentDeadline: string; // ISO 8601 형식
  customGuideText?: string; // 커스텀 안내 문구
  customDetails?: string; // 커스텀 상세 내용
  customNotice?: string; // 커스텀 유의사항
  buttonText?: string; // 커스텀 버튼명
}

// 예약 생성 응답 타입
export interface CreateReservationResponse {
  success: boolean;
  reservation?: {
    id: string;
    status: ReservationStatus;
    procedureName: string;
    reservationDate: string;
    reservationTime: string;
    depositAmount: number;
    currency: string;
    paymentDeadline: string;
    createdAt: Date;
  };
  message?: {
    id: string;
    content: string;
    createdAt: Date;
  };
  error?: string;
}

// 다국어 메시지 템플릿 타입
export interface ReservationMessageTemplate {
  ko_KR: string;
  en_US: string;
  th_TH: string;
}

// 예약 메시지 데이터 타입
export interface ReservationMessageData {
  hospitalName: string;
  procedureName: string;
  reservationDate: string;
  reservationTime: string;
  depositAmount: number;
  currency: string;
  paymentDeadline: string;
  customGuideText?: string;
  customDetails?: string;
  customNotice?: string;
  buttonText?: string;
}

// Prisma 타입을 활용한 예약 타입
export type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        displayName: true;
        name: true;
      };
    };
    hospital: {
      select: {
        id: true;
        name: true;
      };
    };
    payments: true;
    statusHistory: {
      orderBy: {
        createdAt: 'desc';
      };
    };
  };
}>;

// 예약 상태 변경 이력 타입
export type ReservationStatusHistoryWithUser = Prisma.ReservationStatusHistoryGetPayload<{
  include: {
    reservation: {
      select: {
        id: true;
        procedureName: true;
        status: true;
      };
    };
  };
}>;

// 예약 목록 조회용 타입
export interface ReservationListRequest {
  hospitalId?: string;
  userId?: string;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'reservationDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ReservationListResponse {
  success: boolean;
  reservations: ReservationWithRelations[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

// 예약 상세 조회용 타입
export interface GetReservationByIdRequest {
  id: string;
}

export interface GetReservationByIdResponse {
  success: boolean;
  reservation?: ReservationWithRelations;
  error?: string;
}

// 예약 상태 업데이트 요청 타입
export interface UpdateReservationStatusRequest {
  id: string;
  status: ReservationStatus;
  reason?: string;
  changedBy?: string;
}

export interface UpdateReservationStatusResponse {
  success: boolean;
  reservation?: ReservationWithRelations;
  error?: string;
}

// 예약 취소 요청 타입
export interface CancelReservationRequest {
  id: string;
  reason: string;
  cancelledBy: string;
}

export interface CancelReservationResponse {
  success: boolean;
  reservation?: ReservationWithRelations;
  error?: string;
}

// 날짜 포맷팅 옵션 타입
export interface DateFormatOptions {
  locale: ReservationLanguage;
  timeZone?: string;
}

// 요일 타입
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// 다국어 요일 매핑
export const DAY_OF_WEEK_MAP: Record<ReservationLanguage, Record<DayOfWeek, string>> = {
  ko_KR: {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일',
  },
  en_US: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  th_TH: {
    monday: 'จันทร์',
    tuesday: 'อังคาร',
    wednesday: 'พุธ',
    thursday: 'พฤหัสบดี',
    friday: 'ศุกร์',
    saturday: 'เสาร์',
    sunday: 'อาทิตย์',
  },
};

// 기본 메시지 템플릿 상수
export const DEFAULT_MESSAGE_TEMPLATES: Record<ReservationLanguage, ReservationMessageTemplate> = {
  ko_KR: {
    ko_KR: `예약 희망날짜 {date} 예약 가능 확인되었습니다.
예약금을 입금하시면 예약이 최종 확정됩니다.

아래 내용을 확인하신 후 예약금을 입금해주세요.

[ 상세 내용 ]
병원명: {hospitalName}
시술명: {procedureName}
시술 예약 날짜: {date}({dayOfWeek})
시술 예약 시간: {time} KST
예약금: {amount} USD
예약금 입금 기한: {deadline}

[ 유의사항 ]
- 입금 기한 내 입금이 확인되지 않는 경우 예약은 자동 취소됩니다.
- 예약금은 예약 확정 대행 비용입니다.
- 시술 비용은 현장 상담 후 결정되며 현장에서 결제 진행하셔야 합니다.
- 시술 진행여부와 관련 없이 예약금은 환불되지 않습니다.
- 예약 시간은 병원의 사정에 의해 변동될 수 있습니다.`,
    en_US: '',
    th_TH: '',
  },
  en_US: {
    ko_KR: '',
    en_US: `Reservation confirmed for {date}.
Your reservation will be finalized upon deposit payment.

Please review the details below and proceed with the deposit payment.

[ Details ]
Hospital: {hospitalName}
Procedure: {procedureName}
Reservation Date: {date} ({dayOfWeek})
Reservation Time: {time} KST
Deposit: {amount} USD
Payment Deadline: {deadline}

[ Important Notes ]
- Reservation will be automatically cancelled if payment is not received by the deadline.
- Deposit is a reservation confirmation fee.
- Procedure cost will be determined after on-site consultation and payment will be made on-site.
- Deposit is non-refundable regardless of procedure completion.
- Reservation time may be subject to change due to hospital circumstances.`,
    th_TH: '',
  },
  th_TH: {
    ko_KR: '',
    en_US: '',
    th_TH: `ยืนยันการจองสำหรับวันที่ {date}
การจองของคุณจะได้รับการยืนยันเมื่อชำระเงินมัดจำแล้ว

กรุณาตรวจสอบรายละเอียดด้านล่างและดำเนินการชำระเงินมัดจำ

[ รายละเอียด ]
โรงพยาบาล: {hospitalName}
การรักษา: {procedureName}
วันที่จอง: {date} ({dayOfWeek})
เวลาจอง: {time} KST
เงินมัดจำ: {amount} USD
กำหนดชำระเงิน: {deadline}

[ ข้อควรทราบ ]
- การจองจะถูกยกเลิกอัตโนมัติหากไม่ได้รับเงินภายในกำหนด
- เงินมัดจำเป็นค่าธรรมเนียมการยืนยันการจอง
- ค่ารักษาจะถูกกำหนดหลังจากการปรึกษาที่โรงพยาบาลและชำระเงินที่โรงพยาบาล
- เงินมัดจำไม่สามารถคืนได้ไม่ว่าจะทำการรักษาหรือไม่
- เวลาจองอาจเปลี่ยนแปลงได้ตามสถานการณ์ของโรงพยาบาล`,
  },
};

// 기본 버튼 텍스트
export const DEFAULT_BUTTON_TEXTS: Record<ReservationLanguage, string> = {
  ko_KR: '예약 대행 금액 입금하기',
  en_US: 'Pay Reservation Deposit',
  th_TH: 'ชำระเงินมัดจำการจอง',
};
