'use client';

import React from 'react';
import { extractPictureTags, removePictureTags } from '@/shared/lib/image-parser';
import { extractPaymentFlag, removePaymentFlag } from '@/shared/lib/payment-parser/payment-parser';
import { PaymentButtons } from '@/shared/ui/payment-buttons';
import { MessageImage } from '@/shared/ui/message-image';

interface ParseCombinedMessageParams {
  message: string;
  returnUrl?: string;
}

/**
 * 메시지에서 <picture>, <payment>를 모두 처리하는 통합 파서
 * 우선순위: picture → payment → text
 */
export function parseCombinedMessage({
  message,
  returnUrl,
}: ParseCombinedMessageParams): (string | React.ReactElement)[] {
  if (!message) return [message];

  const result: (string | React.ReactElement)[] = [];

  // 1. Picture 태그 추출 및 처리
  const pictures = extractPictureTags(message);
  let textWithoutPictures = removePictureTags(message);

  // 2. Payment 태그 추출 및 처리
  const paymentData = extractPaymentFlag(textWithoutPictures);
  const textWithoutPayment = paymentData
    ? removePaymentFlag(textWithoutPictures)
    : textWithoutPictures;

  // 3. 텍스트가 있으면 추가
  if (textWithoutPayment.trim()) {
    result.push(textWithoutPayment);
  }

  // 4. Picture 이미지 추가
  pictures.forEach((picture, index) => {
    result.push(<MessageImage key={`picture-${index}`} url={picture.url} />);
  });

  // 5. Payment 버튼 추가
  if (paymentData) {
    const paymentDataWithReturnUrl = returnUrl ? { ...paymentData, returnUrl } : paymentData;
    result.push(<PaymentButtons key='payment-buttons' data={paymentDataWithReturnUrl} />);
  }

  return result;
}
