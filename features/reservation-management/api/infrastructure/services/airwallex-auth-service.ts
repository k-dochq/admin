import { AirwallexAuthResponse } from '../../entities/airwallex-types';

/**
 * Airwallex 인증 서비스
 * Airwallex API 인증 토큰 발급 담당
 */
export class AirwallexAuthService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.AIRWALLEX_BASE_URL!;
    this.clientId = process.env.AIRWALLEX_CLIENT_ID!;
    this.apiKey = process.env.AIRWALLEX_API_KEY!;

    if (!this.baseUrl || !this.clientId || !this.apiKey) {
      throw new Error('Airwallex 환경변수가 설정되지 않았습니다.');
    }
  }

  /**
   * Airwallex API 인증 토큰 발급
   */
  async authenticate(): Promise<string> {
    try {
      console.log('[Airwallex] 인증 요청 시작');
      const response = await fetch(`${this.baseUrl}/api/v1/authentication/login`, {
        method: 'POST',
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      console.log('[Airwallex] 인증 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Airwallex] 인증 에러 응답:', errorText);
        throw new Error(`Airwallex 인증 실패: ${response.status} ${errorText}`);
      }

      const authData: AirwallexAuthResponse = await response.json();
      console.log('[Airwallex] 인증 성공, 토큰 발급 완료');
      return authData.token;
    } catch (error) {
      console.error('[Airwallex] 인증 오류:', error);
      throw new Error(
        `Airwallex 인증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
