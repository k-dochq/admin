import { AirwallexAuthService } from './airwallex-auth-service';
import {
  type AirwallexPaymentLinkRequest,
  type AirwallexPaymentLinkResponse,
} from '../../entities/airwallex-types';

/**
 * Airwallex 결제링크 서비스
 * Airwallex Payment Links API 호출 담당
 */
export class AirwallexPaymentLinkService {
  private readonly baseUrl: string;

  constructor(private authService: AirwallexAuthService) {
    this.baseUrl = process.env.AIRWALLEX_BASE_URL!;

    if (!this.baseUrl) {
      throw new Error('AIRWALLEX_BASE_URL 환경변수가 설정되지 않았습니다.');
    }
  }

  /**
   * Airwallex 결제링크 생성
   */
  async createPaymentLink(
    request: AirwallexPaymentLinkRequest,
  ): Promise<AirwallexPaymentLinkResponse> {
    try {
      console.log('[Airwallex] 인증 토큰 발급 시작');
      // 1. 인증 토큰 발급
      const token = await this.authService.authenticate();
      console.log('[Airwallex] 인증 토큰 발급 성공');

      console.log('[Airwallex] 결제링크 생성 API 호출 시작');
      // 2. 결제링크 생성 API 호출
      const response = await fetch(`${this.baseUrl}/api/v1/pa/payment_links/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      console.log('[Airwallex] API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Airwallex] API 에러 응답:', errorText);
        throw new Error(`Airwallex 결제링크 생성 실패: ${response.status} ${errorText}`);
      }

      const paymentLink: AirwallexPaymentLinkResponse = await response.json();
      console.log('[Airwallex] 결제링크 생성 성공:', paymentLink);
      return paymentLink;
    } catch (error) {
      console.error('[Airwallex] 결제링크 생성 오류:', error);
      throw new Error(
        `Airwallex 결제링크 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
