import { type HospitalLocale } from '@/shared/lib/types/locale';
import {
  type MedicalSurveyMessageData,
  type MedicalSurveyMessageTemplate,
  type SurveyButtonData,
  MEDICAL_SURVEY_MESSAGE_TEMPLATES,
  SURVEY_BUTTON_TEXTS,
} from '../entities/types';

/**
 * 의료설문 메시지 생성 서비스
 * 다국어 지원 및 버튼 데이터 포함
 */
export class MedicalSurveyMessageService {
  /**
   * 의료설문 안내 메시지 생성
   */
  static generateMedicalSurveyMessage(
    data: MedicalSurveyMessageData,
    buttonData: SurveyButtonData,
  ): string {
    const template = MEDICAL_SURVEY_MESSAGE_TEMPLATES[data.language];
    const buttonText = data.buttonText || SURVEY_BUTTON_TEXTS[data.language];

    // 버튼 데이터를 JSON 문자열로 변환
    const buttonDataJson = JSON.stringify({
      consultationId: buttonData.consultationId,
      userId: buttonData.userId,
      hospitalId: buttonData.hospitalId,
      language: buttonData.language,
      buttonText: buttonText,
    });

    // 템플릿의 {JSON} 플레이스홀더를 실제 버튼 데이터로 치환
    const message = template.replace('{JSON}', buttonDataJson);

    return message;
  }

  /**
   * consultationId 생성
   * hospitalId와 userId를 조합하여 생성
   */
  static createConsultationId(hospitalId: string, userId: string): string {
    return `${hospitalId}-${userId}`;
  }
}
