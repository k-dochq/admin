import {
  type ReservationLanguage,
  type ReservationMessageData,
  type ReservationMessageTemplate,
  type PaymentButtonData,
  DEFAULT_MESSAGE_TEMPLATES,
  DEFAULT_BUTTON_TEXTS,
  CANCEL_BUTTON_TEXTS,
  DAY_OF_WEEK_MAP,
} from '../entities/types';
import { formatThaiDate, formatThaiDateWithMonthName } from '../lib/thai-date-formatter';

/**
 * 예약 메시지 생성 서비스
 * 다국어 지원 및 커스터마이징 기능 제공
 */
export class ReservationMessageService {
  /**
   * 예약 안내 메시지 생성
   */
  static generateReservationMessage(
    data: ReservationMessageData,
    language: ReservationLanguage,
    customTemplate?: Partial<ReservationMessageTemplate>,
  ): string {
    const template = this.getTemplate(language, customTemplate);
    const formattedData = this.formatMessageData(data, language);

    return this.replaceTemplateVariables(template, formattedData);
  }

  /**
   * 언어별 메시지 템플릿 가져오기
   */
  private static getTemplate(
    language: ReservationLanguage,
    customTemplate?: Partial<ReservationMessageTemplate>,
  ): string {
    const defaultTemplate = DEFAULT_MESSAGE_TEMPLATES[language][language];

    if (customTemplate && customTemplate[language]) {
      return customTemplate[language]!;
    }

    return defaultTemplate;
  }

  /**
   * 메시지 데이터 포맷팅
   */
  private static formatMessageData(
    data: ReservationMessageData,
    language: ReservationLanguage,
  ): Record<string, string> {
    const formattedDate = this.formatDate(data.reservationDate, language);
    const dayOfWeek = this.getDayOfWeek(data.reservationDate, language);
    const formattedDeadline = this.formatDeadline(data.paymentDeadline, language);
    const formattedAmount = this.formatAmount(data.depositAmount, data.currency);

    return {
      hospitalName: data.hospitalName,
      procedureName: data.procedureName,
      date: formattedDate,
      dayOfWeek,
      time: data.reservationTime,
      amount: formattedAmount,
      currency: data.currency,
      deadline: formattedDeadline,
      customGuideText: data.customGuideText || '',
      customDetails: data.customDetails || '',
      customNotice: data.customNotice || '',
      buttonText: data.buttonText || DEFAULT_BUTTON_TEXTS[language],
    };
  }

  /**
   * 템플릿 변수 치환
   */
  private static replaceTemplateVariables(template: string, data: Record<string, string>): string {
    let message = template;

    // 기본 변수들 치환
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    // 커스텀 섹션 처리
    message = this.processCustomSections(message, data);

    return message;
  }

  /**
   * 커스텀 섹션 처리
   */
  private static processCustomSections(message: string, data: Record<string, string>): string {
    // 커스텀 안내 문구가 있으면 기본 문구 대체
    if (data.customGuideText) {
      const guidePattern = /예약 희망날짜.*?예약금을 입금하시면 예약이 최종 확정됩니다\./;
      message = message.replace(guidePattern, data.customGuideText);
    }

    // 커스텀 상세 내용이 있으면 기본 상세 내용 대체
    if (data.customDetails) {
      const detailsPattern = /\[ 상세 내용 \].*?(?=\[ 유의사항 \]|$)/;
      message = message.replace(detailsPattern, `[ 상세 내용 ]\n${data.customDetails}`);
    }

    // 커스텀 유의사항이 있으면 기본 유의사항 대체
    if (data.customNotice) {
      const noticePattern = /\[ 유의사항 \].*$/;
      message = message.replace(noticePattern, `[ 유의사항 ]\n${data.customNotice}`);
    }

    return message;
  }

  /**
   * 날짜 포맷팅
   */
  private static formatDate(dateString: string, language: ReservationLanguage): string {
    const date = new Date(dateString);

    switch (language) {
      case 'ko_KR':
        return date
          .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\./g, '.')
          .replace(/\s/g, '');

      case 'en_US':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

      case 'th_TH':
        return formatThaiDate(date);

      default:
        return dateString;
    }
  }

  /**
   * 요일 가져오기
   */
  private static getDayOfWeek(dateString: string, language: ReservationLanguage): string {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const dayNames: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayOfWeek = dayNames[dayIndex];

    return DAY_OF_WEEK_MAP[language][dayOfWeek];
  }

  /**
   * 입금 기한 포맷팅
   */
  private static formatDeadline(deadlineString: string, language: ReservationLanguage): string {
    const date = new Date(deadlineString);

    switch (language) {
      case 'ko_KR':
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

      case 'en_US':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'th_TH':
        return formatThaiDateWithMonthName(date);

      default:
        return deadlineString;
    }
  }

  /**
   * 금액 포맷팅
   */
  private static formatAmount(amount: number, currency: string): string {
    switch (currency) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'KRW':
        return `₩${amount.toLocaleString()}`;
      case 'THB':
        return `฿${amount.toLocaleString()}`;
      default:
        return `${amount} ${currency}`;
    }
  }

  /**
   * 예약 확정 메시지 생성 (결제 완료 후)
   */
  static generateConfirmationMessage(
    data: ReservationMessageData,
    language: ReservationLanguage,
  ): string {
    const confirmationTemplates: Record<ReservationLanguage, string> = {
      ko_KR: `예약 확정

[ 상세 내용 ]
병원명: {hospitalName}
시술명: {procedureName}
시술 예약 날짜: {date}({dayOfWeek})
시술 예약 시간: {time}
예약금: {amount} USD

[ 유의사항 ]
- 입금 기한 내 입금이 확인되지 않는 경우 예약은 자동 취소됩니다.
- 예약금은 예약 확정 대행 비용입니다.
- 시술 비용은 현장 상담 후 결정되며 현장에서 결제 진행하셔야 합니다.
- 시술 진행여부와 관련 없이 예약금은 환불되지 않습니다.`,

      en_US: `Reservation Confirmed

[ Details ]
Hospital: {hospitalName}
Procedure: {procedureName}
Reservation Date: {date} ({dayOfWeek})
Reservation Time: {time}
Deposit: {amount} USD

[ Important Notes ]
- Reservation will be automatically cancelled if payment is not received by the deadline.
- Deposit is a reservation confirmation fee.
- Procedure cost will be determined after on-site consultation and payment will be made on-site.
- Deposit is non-refundable regardless of procedure completion.`,

      th_TH: `ยืนยันการจอง

[ รายละเอียด ]
โรงพยาบาล: {hospitalName}
การรักษา: {procedureName}
วันที่จอง: {date} ({dayOfWeek})
เวลาจอง: {time}
เงินมัดจำ: {amount} USD

[ ข้อควรทราบ ]
- การจองจะถูกยกเลิกอัตโนมัติหากไม่ได้รับเงินภายในกำหนด
- เงินมัดจำเป็นค่าธรรมเนียมการยืนยันการจอง
- ค่ารักษาจะถูกกำหนดหลังจากการปรึกษาที่โรงพยาบาลและชำระเงินที่โรงพยาบาล
- เงินมัดจำไม่สามารถคืนได้ไม่ว่าจะทำการรักษาหรือไม่`,
    };

    const template = confirmationTemplates[language];
    const formattedData = this.formatMessageData(data, language);

    return this.replaceTemplateVariables(template, formattedData);
  }

  /**
   * 예약 취소 메시지 생성
   */
  static generateCancellationMessage(
    data: ReservationMessageData,
    language: ReservationLanguage,
    reason?: string,
  ): string {
    const cancellationTemplates: Record<ReservationLanguage, string> = {
      ko_KR: `예약이 취소되었습니다.

[ 취소된 예약 정보 ]
병원명: {hospitalName}
시술명: {procedureName}
예약 날짜: {date}({dayOfWeek})
예약 시간: {time}

${reason ? `취소 사유: ${reason}` : ''}`,

      en_US: `Reservation has been cancelled.

[ Cancelled Reservation Details ]
Hospital: {hospitalName}
Procedure: {procedureName}
Reservation Date: {date} ({dayOfWeek})
Reservation Time: {time}

${reason ? `Cancellation Reason: ${reason}` : ''}`,

      th_TH: `การจองถูกยกเลิกแล้ว

[ รายละเอียดการจองที่ยกเลิก ]
โรงพยาบาล: {hospitalName}
การรักษา: {procedureName}
วันที่จอง: {date} ({dayOfWeek})
เวลาจอง: {time}

${reason ? `เหตุผลการยกเลิก: ${reason}` : ''}`,
    };

    const template = cancellationTemplates[language];
    const formattedData = this.formatMessageData(data, language);

    return this.replaceTemplateVariables(template, formattedData);
  }

  /**
   * 메시지에 결제 버튼 flag 추가
   * 메시지 끝에 <payment>{JSON}</payment> 형식으로 추가
   */
  static addPaymentFlag(message: string, paymentData: PaymentButtonData): string {
    const paymentJson = JSON.stringify(paymentData);
    return `${message}\n\n<payment>${paymentJson}</payment>`;
  }
}

// 타입 정의를 위한 DayOfWeek 타입 추가
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
