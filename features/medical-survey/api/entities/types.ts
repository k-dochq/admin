import { type HospitalLocale } from '@/shared/lib/types/locale';

/**
 * 의료설문 버튼 데이터 타입
 */
export interface SurveyButtonData {
  consultationId: string; // hospitalId와 userId로 생성
  userId: string;
  hospitalId: string;
  language: HospitalLocale;
  buttonText: string; // 언어별 "의료 설문 작성하기"
  cooldownDays?: number; // 중복 설문 불가 기간 (일 단위)
}

/**
 * 의료설문 메시지 데이터 타입
 */
export interface MedicalSurveyMessageData {
  language: HospitalLocale;
  buttonText: string;
}

/**
 * 의료설문 메시지 템플릿 타입
 */
export interface MedicalSurveyMessageTemplate {
  ko_KR: string;
  en_US: string;
  zh_TW: string;
  ja_JP: string;
  th_TH: string;
  hi_IN: string;
  tl_PH: string;
  ar_SA: string;
}

/**
 * 의료설문 메시지 생성 요청 타입
 */
export interface CreateMedicalSurveyMessageRequest {
  hospitalId: string;
  userId: string;
  language: HospitalLocale;
  cooldownDays?: number; // 중복 설문 불가 기간 (일 단위)
}

/**
 * 의료설문 메시지 생성 응답 타입
 */
export interface CreateMedicalSurveyMessageResponse {
  success: boolean;
  message?: {
    id: string;
    content: string;
    timestamp: string;
    createdAt: Date;
  };
  error?: string;
}

/**
 * 언어별 버튼 텍스트
 */
export const SURVEY_BUTTON_TEXTS: Record<HospitalLocale, string> = {
  ko_KR: '의료 설문 작성하기',
  en_US: 'Complete Medical Survey',
  zh_TW: '填寫醫療問卷',
  ja_JP: '医療アンケート記入',
  th_TH: 'กรอกแบบสอบถามทางการแพทย์',
  hi_IN: 'चिकित्सा सर्वेक्षण पूरा करें',
  tl_PH: 'Kumpletuhin ang Medical Survey',
  ar_SA: 'أكمل الاستبيان الطبي',
};

/**
 * 언어별 메시지 템플릿
 */
export const MEDICAL_SURVEY_MESSAGE_TEMPLATES: MedicalSurveyMessageTemplate = {
  ko_KR: `안전하고 정확한 상담을 위해 간단한 의료 설문 작성을 부탁드립니다.

입력해 주신 의료 정보는 병원 측에서 시술 가능 여부를 판단하는 데 사용됩니다.

[안내 사항]
입력하신 정보는 의료 상담 목적 외에는 사용되지 않습니다.
해당 설문은 시술 확정을 의미하지 않습니다.
의료 설문 작성 후 상담이 진행됩니다.

<survey>{JSON}</survey>`,
  en_US: `We kindly request you to complete a brief medical questionnaire for safe and accurate consultation.

The medical information you provide will be used by the hospital to determine procedure feasibility.

[Notice]
Your information will only be used for medical consultation purposes.
This questionnaire does not confirm a procedure.
Consultation will proceed after completing the medical questionnaire.

<survey>{JSON}</survey>`,
  zh_TW: `為了安全準確的諮詢，請您填寫簡短的醫療問卷。

您提供的醫療資訊將用於醫院判斷手術可行性。

[注意事項]
您提供的資訊僅用於醫療諮詢目的。
此問卷不代表手術確認。
填寫醫療問卷後將進行諮詢。

<survey>{JSON}</survey>`,
  ja_JP: `安全で正確な相談のために、簡単な医療アンケートの記入をお願いいたします。

ご入力いただいた医療情報は、病院側で施術の可否を判断するために使用されます。

[ご案内]
入力いただいた情報は、医療相談目的以外には使用されません。
このアンケートは施術確定を意味するものではありません。
医療アンケート記入後、相談が進行します。

<survey>{JSON}</survey>`,
  th_TH: `เราขอให้คุณกรอกแบบสอบถามทางการแพทย์สั้นๆ เพื่อการปรึกษาที่ปลอดภัยและถูกต้อง

ข้อมูลทางการแพทย์ที่คุณให้มาจะถูกใช้โดยโรงพยาบาลเพื่อประเมินความเป็นไปได้ในการทำหัตถการ

[ข้อควรทราบ]
ข้อมูลของคุณจะถูกใช้เพื่อวัตถุประสงค์ในการปรึกษาทางการแพทย์เท่านั้น
แบบสอบถามนี้ไม่ได้หมายถึงการยืนยันการทำหัตถการ
การปรึกษาจะดำเนินต่อไปหลังจากกรอกแบบสอบถามทางการแพทย์

<survey>{JSON}</survey>`,
  hi_IN: `सुरक्षित और सटीक परामर्श के लिए, कृपया एक संक्षिप्त चिकित्सा प्रश्नावली पूरी करें।

आपके द्वारा प्रदान की गई चिकित्सा जानकारी का उपयोग अस्पताल द्वारा प्रक्रिया की व्यवहार्यता निर्धारित करने के लिए किया जाएगा।

[सूचना]
आपकी जानकारी का उपयोग केवल चिकित्सा परामर्श उद्देश्यों के लिए किया जाएगा।
यह प्रश्नावली प्रक्रिया की पुष्टि का मतलब नहीं है।
चिकित्सा प्रश्नावली पूरी करने के बाद परामर्श आगे बढ़ेगा।

<survey>{JSON}</survey>`,
  tl_PH: `We kindly request you to complete a brief medical questionnaire for safe and accurate consultation.

The medical information you provide will be used by the hospital to determine procedure feasibility.

[Notice]
Your information will only be used for medical consultation purposes.
This questionnaire does not confirm a procedure.
Consultation will proceed after completing the medical questionnaire.

<survey>{JSON}</survey>`,
  ar_SA: `We kindly request you to complete a brief medical questionnaire for safe and accurate consultation.

The medical information you provide will be used by the hospital to determine procedure feasibility.

[Notice]
Your information will only be used for medical consultation purposes.
This questionnaire does not confirm a procedure.
Consultation will proceed after completing the medical questionnaire.

<survey>{JSON}</survey>`,
};
