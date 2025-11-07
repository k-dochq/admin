'use client';

import { type PaymentButtonData } from '@/shared/lib/payment-parser/types';

interface PaymentButtonsProps {
  data: PaymentButtonData;
}

export function PaymentButtons({ data }: PaymentButtonsProps) {
  return (
    <div className='flex w-full flex-col gap-[10px] pt-2'>
      {/* 결제 버튼 */}
      <div className='flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff60f7] to-[#ae33fb] px-5 py-3'>
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[20px] text-white">
          {data.paymentButtonText}
        </p>
      </div>
      {/* 취소 버튼 */}
      <div className='flex w-full items-center justify-center'>
        <p className="font-['Pretendard:Regular',sans-serif] text-[14px] leading-[20px] text-neutral-500">
          {data.cancelButtonText}
        </p>
      </div>
    </div>
  );
}
