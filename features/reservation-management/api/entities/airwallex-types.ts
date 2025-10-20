/**
 * Airwallex API 관련 타입 정의
 */

export interface AirwallexAuthResponse {
  token: string;
  expires_at: string;
}

export interface AirwallexPaymentLinkRequest {
  amount: number;
  currency: string;
  description: string;
  expires_at: string;
  metadata: {
    reservation_id: string;
    hospital_id: string;
    user_id: string;
  };
  reference: string;
  reusable: boolean;
  title: string;
}

export interface AirwallexPaymentLinkResponse {
  id: string;
  url: string;
  active: boolean;
  amount: number;
  currency: string;
  status: string;
  description: string;
  title: string;
  reference: string;
  reusable: boolean;
  expires_at: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}
