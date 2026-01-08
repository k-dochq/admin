import { type HospitalLocale, LOCALE_TO_LANG_CODE_MAP } from '@/shared/lib/types/locale';

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * 언어별 이메일 템플릿
 */
export function getEmailTemplate(language: HospitalLocale, chatUrl: string): EmailTemplate {
  const templates: Record<HospitalLocale, EmailTemplate> = {
    ko_KR: {
      subject: '병원 상담 답변이 도착했습니다',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">병원 상담 답변이 도착했습니다</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              문의하신 병원 상담에 대한 답변이 등록되었습니다.<br/>
              아래 버튼을 클릭하여 답변을 확인해주세요.
            </p>
            <a href="${chatUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 20px 0;">
              답변 확인하기
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              이 메일은 발신 전용입니다. 답장하지 마세요.
            </p>
          </div>
        </div>
      `,
    },
    en_US: {
      subject: 'Hospital Consultation Reply Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Hospital Consultation Reply Received</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              A reply to your hospital consultation inquiry has been registered.<br/>
              Please click the button below to view the reply.
            </p>
            <a href="${chatUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 20px 0;">
              View Reply
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `,
    },
    zh_TW: {
      subject: '醫院諮詢回覆已送達',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">醫院諮詢回覆已送達</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              您詢問的醫院諮詢回覆已註冊。<br/>
              請點擊下方按鈕查看回覆。
            </p>
            <a href="${chatUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 20px 0;">
              查看回覆
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              此為自動發送郵件，請勿回覆。
            </p>
          </div>
        </div>
      `,
    },
    ja_JP: {
      subject: '病院相談の返信が届きました',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">病院相談の返信が届きました</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              お問い合わせいただいた病院相談への返信が登録されました。<br/>
              下のボタンをクリックして返信を確認してください。
            </p>
            <a href="${chatUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 20px 0;">
              返信を確認する
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              このメールは自動送信です。返信しないでください。
            </p>
          </div>
        </div>
      `,
    },
    th_TH: {
      subject: 'ได้รับคำตอบการปรึกษาจากโรงพยาบาล',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">ได้รับคำตอบการปรึกษาจากโรงพยาบาล</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              คำตอบสำหรับการปรึกษาจากโรงพยาบาลที่คุณสอบถามได้ถูกบันทึกแล้ว<br/>
              กรุณาคลิกปุ่มด้านล่างเพื่อดูคำตอบ
            </p>
            <a href="${chatUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 20px 0;">
              ดูคำตอบ
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              นี่คืออีเมลอัตโนมัติ กรุณาอย่าตอบกลับ
            </p>
          </div>
        </div>
      `,
    },
  };

  return templates[language];
}

/**
 * HospitalLocale를 k-doc URL locale로 변환
 */
export function getLocaleForUrl(language: HospitalLocale): string {
  return LOCALE_TO_LANG_CODE_MAP[language];
}

/**
 * 채팅 페이지 URL 생성
 */
export function buildChatUrl(hospitalId: string, language: HospitalLocale): string {
  const locale = getLocaleForUrl(language);
  return `https://www.k-doc.kr/${locale}/chat/${hospitalId}`;
}
