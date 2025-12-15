import {
  ReservationStatus,
  PaymentStatus,
  Prisma,
  Reservation,
  Payment,
  Hospital,
  User,
  ReservationStatusHistory,
} from '@prisma/client';

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
    timestamp: string;
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
    ko_KR: `예약 신청 확인
{date} 예약 신청이 접수되었습니다.
의료 패키지 예약금 입금이 완료되면 예약이 확정됩니다.
아래 내용을 확인하신 후 기한 내에 예약금을 입금해주세요.

패키지 링크
https://www.k-doc.kr/ko/event/package

예약 상세 내용
병원명: {hospitalName}
시술명: {procedureName}
예약 날짜: {date} ({dayOfWeek})
예약 시간: {time} (KST)
오늘 입금: {amount}
입금 기한: {deadline}

유의사항
- 기한 내 결제가 완료되지 않으면 예약이 자동 취소됩니다.
- 최종 시술 비용은 현장 상담 후 결정되며, 병원에서 결제하시게 됩니다.
- 예약하신 병원에서 $500 할인 혜택을 받으실 수 있습니다.
- 예약 당일 예약금은 시술 완료 여부와 관계없이 환불되지 않습니다.
- 시술 예정일 3일 전 이상 취소: 90% 환불
- 시술 예정일 2일 전 취소: 50% 환불
- 시술 예정일 1일 전 취소: 20% 환불
- 시술 예정일 당일 또는 이후 취소: 환불 불가
- 예약 시간은 병원 일정에 따라 조정될 수 있습니다.`,
    en_US: '',
    th_TH: '',
  },
  en_US: {
    ko_KR: '',
    en_US: `Reservation Request Confirmation
Your reservation request for {date} has been received.
The reservation will be confirmed once the medical package deposit is completed.
Please review the details below and proceed with the deposit payment within the deadline.

Package Link
https://www.k-doc.kr/en/event/package

Reservation Details
Hospital: {hospitalName}
Procedure: {procedureName}
Reservation Date: {date} ({dayOfWeek})
Reservation Time: {time} (KST)
Due Today: {amount}
Payment Deadline: {deadline}

Important Notes
- The reservation will be automatically cancelled if the payment is not made by the due date.
- The final procedure cost will be determined after an on-site consultation, and payment will be made at the clinic.
- You will pay -$500 less at reserved clinic and receive benefits for free.
- The deposit is non-refundable on the day of reservation, regardless of whether the procedure is completed.
- Cancellation 3 days or more before the scheduled surgery date: 90% Refund
- Cancellation 2 days before the scheduled surgery date: 50% Refund
- Cancellation 1 day before the scheduled surgery date: 20% Refund
- Cancellation on the day of or after the scheduled surgery date: No Refund
- Reservation time may be adjusted depending on the clinic's schedule.`,
    th_TH: '',
  },
  th_TH: {
    ko_KR: '',
    en_US: '',
    th_TH: `ยืนยันการจอง
คำขอจองของคุณสำหรับวันที่ {date} ได้รับแล้ว
การจองจะได้รับการยืนยันเมื่อชำระเงินมัดจำแพ็คเกจการแพทย์เสร็จสิ้น
กรุณาตรวจสอบรายละเอียดด้านล่างและดำเนินการชำระเงินมัดจำภายในกำหนดเวลา

ลิงก์แพ็คเกจ
https://www.k-doc.kr/th/event/package

รายละเอียดการจอง
โรงพยาบาล: {hospitalName}
การรักษา: {procedureName}
วันที่จอง: {date} ({dayOfWeek})
เวลาจอง: {time} (KST)
ชำระวันนี้: {amount}
กำหนดชำระเงิน: {deadline}

ข้อควรทราบ
- การจองจะถูกยกเลิกอัตโนมัติหากไม่ชำระเงินภายในวันครบกำหนด
- ค่ารักษาสุดท้ายจะถูกกำหนดหลังจากการปรึกษาที่สถานที่ และการชำระเงินจะทำที่คลินิก
- คุณจะจ่ายน้อยลง $500 ที่คลินิกที่จองไว้และได้รับประโยชน์ฟรี
- เงินมัดจำไม่สามารถคืนได้ในวันจอง ไม่ว่าจะทำการรักษาเสร็จหรือไม่
- ยกเลิก 3 วันหรือมากกว่านั้นก่อนวันที่ผ่าตัดตามกำหนด: คืนเงิน 90%
- ยกเลิก 2 วันก่อนวันที่ผ่าตัดตามกำหนด: คืนเงิน 50%
- ยกเลิก 1 วันก่อนวันที่ผ่าตัดตามกำหนด: คืนเงิน 20%
- ยกเลิกในวันหรือหลังจากวันที่ผ่าตัดตามกำหนด: ไม่คืนเงิน
- เวลาจองอาจปรับเปลี่ยนได้ขึ้นอยู่กับตารางของคลินิก`,
  },
};

// 기본 버튼 텍스트
export const DEFAULT_BUTTON_TEXTS: Record<ReservationLanguage, string> = {
  ko_KR: '예약 대행 금액 입금하기',
  en_US: 'Pay Reservation Deposit',
  th_TH: 'ชำระเงินมัดจำการจอง',
};

// 예약 취소 버튼 텍스트
export const CANCEL_BUTTON_TEXTS: Record<ReservationLanguage, string> = {
  ko_KR: '예약 취소',
  en_US: 'Cancel Reservation',
  th_TH: 'ยกเลิกการจอง',
};

// 결제 버튼 데이터 타입
export interface PaymentButtonData {
  orderId: string; // reservation.id
  customerId: string; // userId
  productName: string; // procedureName
  amount: string; // depositAmount.toString()
  redirectUrl?: string; // 선택사항
  paymentButtonText: string; // 언어별 "예약 대행 금액 입금하기"
  cancelButtonText: string; // 언어별 "예약 취소"
}

// 예약 관리 페이지용 타입 정의

/**
 * 예약 목록 조회 요청
 */
export interface GetReservationsRequest {
  page?: number;
  limit?: number;
  search?: string; // 예약 ID 검색 (최소한의 기능)
  status?: ReservationStatus; // 예약 상태 필터
  hospitalId?: string; // 병원 필터
  userId?: string; // 사용자 필터
  dateFrom?: string; // 예약일 시작 (YYYY-MM-DD)
  dateTo?: string; // 예약일 종료 (YYYY-MM-DD)
}

/**
 * 예약 목록 조회 응답
 */
export interface GetReservationsResponse {
  reservations: ReservationForList[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 예약 목록용 타입 (관계 데이터 포함)
 */
export type ReservationForList = Reservation & {
  hospital: Pick<Hospital, 'id' | 'name'>;
  user: Pick<User, 'id' | 'name' | 'displayName' | 'email' | 'phoneNumber'>;
  payments: Array<
    Pick<Payment, 'id' | 'amount' | 'currency' | 'status' | 'tid' | 'createdAt' | 'updatedAt'>
  >;
  _count: {
    payments: number;
  };
};

/**
 * 예약 상세 정보용 타입
 */
export type ReservationDetail = Reservation & {
  hospital: Pick<Hospital, 'id' | 'name' | 'phoneNumber' | 'email'>;
  user: Pick<User, 'id' | 'name' | 'displayName' | 'email' | 'phoneNumber' | 'phone'>;
  payments: Array<
    Payment & {
      _paymentMethod?: Prisma.JsonValue;
      _refundInfo?: Prisma.JsonValue;
    }
  >;
  statusHistory: Array<
    ReservationStatusHistory & {
      changedByUser?: Pick<User, 'id' | 'name' | 'displayName'> | null;
    }
  >;
};
