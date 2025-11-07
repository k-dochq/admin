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
