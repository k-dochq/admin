'use client';

import React from 'react';
import { extractPictureTags, removePictureTags } from '@/shared/lib/image-parser';
import { extractFileTags, removeFileTags } from '@/shared/lib/file-parser';
import { extractPaymentFlag, removePaymentFlag } from '@/shared/lib/payment-parser/payment-parser';
import { PaymentButtons } from '@/shared/ui/payment-buttons';
import { MessageImage } from '@/shared/ui/message-image';
import { MessageFile } from '@/shared/ui/message-file';

interface ParseCombinedMessageParams {
  message: string;
  returnUrl?: string;
}

/**
 * 메시지에서 <picture>, <file>, <payment>를 모두 처리하는 통합 파서
 * 우선순위: picture → file → payment → text
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

  // 2. File 태그 추출 및 처리
  const files = extractFileTags(textWithoutPictures);
  let textWithoutFiles = removeFileTags(textWithoutPictures);

  // 3. Payment 태그 추출 및 처리
  const paymentData = extractPaymentFlag(textWithoutFiles);
  const textWithoutPayment = paymentData ? removePaymentFlag(textWithoutFiles) : textWithoutFiles;

  // 4. 텍스트가 있으면 추가
  if (textWithoutPayment.trim()) {
    result.push(textWithoutPayment);
  }

  // 5. Picture 이미지 추가
  pictures.forEach((picture, index) => {
    result.push(<MessageImage key={`picture-${index}`} url={picture.url} />);
  });

  // 6. File 문서 추가
  files.forEach((file, index) => {
    result.push(
      <MessageFile
        key={`file-${index}`}
        url={file.url}
        fileName={file.fileName || 'Unknown file'}
        fileSize={file.fileSize}
        mimeType={file.mimeType}
      />,
    );
  });

  // 7. Payment 버튼 추가
  if (paymentData) {
    const paymentDataWithReturnUrl = returnUrl ? { ...paymentData, returnUrl } : paymentData;
    result.push(<PaymentButtons key='payment-buttons' data={paymentDataWithReturnUrl} />);
  }

  return result;
}
