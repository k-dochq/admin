import { type PaymentButtonData } from './types';

/**
 * Payment flag 패턴: <payment>{JSON}</payment>
 */
const PAYMENT_FLAG_REGEX = /<payment>([^<]+)<\/payment>/g;

/**
 * 메시지에서 payment flag를 추출하고 파싱
 * @param message 메시지 내용
 * @returns payment flag가 있으면 PaymentButtonData, 없으면 null
 */
export function extractPaymentFlag(message: string): PaymentButtonData | null {
  const match = message.match(PAYMENT_FLAG_REGEX);

  if (!match || match.length === 0) {
    return null;
  }

  // 첫 번째 매치만 사용 (여러 개가 있을 경우)
  const flagContent = match[0].replace(/<\/?payment>/g, '');

  try {
    const paymentData: PaymentButtonData = JSON.parse(flagContent);

    // 필수 필드 검증
    if (
      !paymentData.orderId ||
      !paymentData.customerId ||
      !paymentData.productName ||
      !paymentData.amount ||
      !paymentData.paymentButtonText ||
      !paymentData.cancelButtonText
    ) {
      console.warn('Payment flag에 필수 필드가 누락되었습니다:', paymentData);
      return null;
    }

    return paymentData;
  } catch (error) {
    console.error('Payment flag JSON 파싱 실패:', error);
    return null;
  }
}

/**
 * 메시지에서 payment flag를 제거
 * @param message 메시지 내용
 * @returns payment flag가 제거된 메시지
 */
export function removePaymentFlag(message: string): string {
  return message.replace(PAYMENT_FLAG_REGEX, '').trim();
}
