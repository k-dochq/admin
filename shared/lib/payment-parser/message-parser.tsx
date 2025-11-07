'use client';

import React from 'react';
import { extractPaymentFlag, removePaymentFlag } from './payment-parser';
import { PaymentButtons } from '@/shared/ui/payment-buttons';

/**
 * 메시지에서 payment flag를 찾아서 버튼으로 변환
 * @param message 메시지 내용
 * @returns React 요소 배열 (텍스트와 버튼 컴포넌트)
 */
export function parseMessageWithPaymentButtons(message: string): (string | React.ReactElement)[] {
  if (!message) return [message];

  const paymentData = extractPaymentFlag(message);

  // payment flag가 없으면 원본 메시지 그대로 반환
  if (!paymentData) {
    return [message];
  }

  // payment flag를 제거한 메시지
  const textWithoutFlag = removePaymentFlag(message);

  const result: (string | React.ReactElement)[] = [];

  // 텍스트가 있으면 먼저 추가
  if (textWithoutFlag.trim()) {
    result.push(textWithoutFlag);
  }

  // PaymentButtons 컴포넌트 추가
  result.push(<PaymentButtons key='payment-buttons' data={paymentData} />);

  return result;
}
