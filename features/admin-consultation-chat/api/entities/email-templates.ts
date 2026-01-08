import { type HospitalLocale, LOCALE_TO_LANG_CODE_MAP } from '@/shared/lib/types/locale';

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * 언어별 이메일 템플릿
 */
export function getEmailTemplate(
  language: HospitalLocale,
  chatUrl: string,
  hospitalName: string,
): EmailTemplate {
  const templates: Record<HospitalLocale, EmailTemplate> = {
    ko_KR: {
      subject: '병원 상담 답변이 도착했습니다',
      html: `
<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;">
    <!-- Top Pink Line -->
    <div style="background-color: #F15BFF; height: 4px; width: 100%;"></div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-left: 1px solid #E5E5E5; border-right: 1px solid #E5E5E5; border-bottom: 1px solid #E5E5E5;">
      <!-- Logo and Title Section -->
      <div style="padding: 40px 32px 0 32px;">
        <!-- Title -->
        <h1 style="margin: 0; padding: 0; font-size: 30px; line-height: 36px; font-weight: 600; color: #404040;">
          문의하신 ${hospitalName}에서<br/>
          <span style="color: #F15BFF;">상담 답변</span>이 도착했습니다
        </h1>
        
        <!-- Description -->
        <div style="margin-top: 12px; font-size: 18px; line-height: 28px; color: #737373; font-weight: 400;">
          <p style="margin: 0 0 8px 0;">병원에서 전달한 상담 답변을 확인하고 추가 상담이나 예약을 이어가실 수 있습니다.</p>
          <p style="margin: 0;">자세한 답변 내용은 아래 버튼을 통해 확인해 주세요.</p>
        </div>
      </div>
      
      <!-- Button -->
      <div style="padding: 40px 32px; text-align: center;">
        <a href="${chatUrl}" style="display: inline-block; background-color: #7657FF; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; line-height: 28px; font-weight: 500;">
          답변 확인하기
        </a>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #F5F5F5; padding: 32px; color: #A3A3A3; font-size: 14px; line-height: 20px;">
        <p style="margin: 0 0 16px 0;">본 메일은 발신 전용으로 회신이 불가합니다.<br/>
        문의 사항이 있는 경우 <span style="text-decoration: underline;">cs@k-doc.kr</span>로 연락해 주세요.</p>
        <p style="margin: 0;">COPYRIGHT © K-DOC. ALL RIGHT RESERVED</p>
      </div>
    </div>
</div>
      `,
    },
    en_US: {
      subject: 'Hospital Consultation Reply Received',
      html: `
<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;">
    <!-- Top Pink Line -->
    <div style="background-color: #F15BFF; height: 4px; width: 100%;"></div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-left: 1px solid #E5E5E5; border-right: 1px solid #E5E5E5; border-bottom: 1px solid #E5E5E5;">
      <!-- Logo and Title Section -->
      <div style="padding: 40px 32px 0 32px;">
        <!-- Title -->
        <h1 style="margin: 0; padding: 0; font-size: 30px; line-height: 36px; font-weight: 600; color: #404040;">
          <span style="color: #F15BFF;">Reply</span> from ${hospitalName}<br/>
          has arrived
        </h1>
        
        <!-- Description -->
        <div style="margin-top: 12px; font-size: 18px; line-height: 28px; color: #737373; font-weight: 400;">
          <p style="margin: 0 0 8px 0;">You can check the consultation reply from the hospital and continue with additional consultations or appointments.</p>
          <p style="margin: 0;">Please click the button below to view the detailed reply.</p>
        </div>
      </div>
      
      <!-- Button -->
      <div style="padding: 40px 32px; text-align: center;">
        <a href="${chatUrl}" style="display: inline-block; background-color: #7657FF; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; line-height: 28px; font-weight: 500;">
          View Reply
        </a>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #F5F5F5; padding: 32px; color: #A3A3A3; font-size: 14px; line-height: 20px;">
        <p style="margin: 0 0 16px 0;">This is an automated email. Please do not reply.<br/>
        If you have any questions, please contact <span style="text-decoration: underline;">cs@k-doc.kr</span>.</p>
        <p style="margin: 0;">COPYRIGHT © K-DOC. ALL RIGHT RESERVED</p>
      </div>
    </div>
</div>
      `,
    },
    zh_TW: {
      subject: '醫院諮詢回覆已送達',
      html: `
<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;">
    <!-- Top Pink Line -->
    <div style="background-color: #F15BFF; height: 4px; width: 100%;"></div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-left: 1px solid #E5E5E5; border-right: 1px solid #E5E5E5; border-bottom: 1px solid #E5E5E5;">
      <!-- Logo and Title Section -->
      <div style="padding: 40px 32px 0 32px;">
        <!-- Title -->
        <h1 style="margin: 0; padding: 0; font-size: 30px; line-height: 36px; font-weight: 600; color: #404040;">
          來自${hospitalName}<br/>
          的<span style="color: #F15BFF;">諮詢回覆</span>已送達
        </h1>
        
        <!-- Description -->
        <div style="margin-top: 12px; font-size: 18px; line-height: 28px; color: #737373; font-weight: 400;">
          <p style="margin: 0 0 8px 0;">您可以查看醫院傳送的諮詢回覆，並繼續進行額外的諮詢或預約。</p>
          <p style="margin: 0;">請點擊下方按鈕查看詳細回覆內容。</p>
        </div>
      </div>
      
      <!-- Button -->
      <div style="padding: 40px 32px; text-align: center;">
        <a href="${chatUrl}" style="display: inline-block; background-color: #7657FF; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; line-height: 28px; font-weight: 500;">
          查看回覆
        </a>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #F5F5F5; padding: 32px; color: #A3A3A3; font-size: 14px; line-height: 20px;">
        <p style="margin: 0 0 16px 0;">此為自動發送郵件，請勿回覆。<br/>
        如有任何問題，請聯繫 <span style="text-decoration: underline;">cs@k-doc.kr</span>。</p>
        <p style="margin: 0;">COPYRIGHT © K-DOC. ALL RIGHT RESERVED</p>
      </div>
    </div>
</div>
      `,
    },
    ja_JP: {
      subject: '病院相談の返信が届きました',
      html: `
<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;">
    <!-- Top Pink Line -->
    <div style="background-color: #F15BFF; height: 4px; width: 100%;"></div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-left: 1px solid #E5E5E5; border-right: 1px solid #E5E5E5; border-bottom: 1px solid #E5E5E5;">
      <!-- Logo and Title Section -->
      <div style="padding: 40px 32px 0 32px;">
        <!-- Title -->
        <h1 style="margin: 0; padding: 0; font-size: 30px; line-height: 36px; font-weight: 600; color: #404040;">
          ${hospitalName}から<br/>
          <span style="color: #F15BFF;">相談の返信</span>が届きました
        </h1>
        
        <!-- Description -->
        <div style="margin-top: 12px; font-size: 18px; line-height: 28px; color: #737373; font-weight: 400;">
          <p style="margin: 0 0 8px 0;">病院から送信された相談の返信を確認し、追加の相談や予約を続けることができます。</p>
          <p style="margin: 0;">詳細な返信内容は下のボタンからご確認ください。</p>
        </div>
      </div>
      
      <!-- Button -->
      <div style="padding: 40px 32px; text-align: center;">
        <a href="${chatUrl}" style="display: inline-block; background-color: #7657FF; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; line-height: 28px; font-weight: 500;">
          返信を確認する
        </a>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #F5F5F5; padding: 32px; color: #A3A3A3; font-size: 14px; line-height: 20px;">
        <p style="margin: 0 0 16px 0;">このメールは自動送信です。返信しないでください。<br/>
        ご質問がある場合は、<span style="text-decoration: underline;">cs@k-doc.kr</span>までご連絡ください。</p>
        <p style="margin: 0;">COPYRIGHT © K-DOC. ALL RIGHT RESERVED</p>
      </div>
    </div>
</div>
      `,
    },
    th_TH: {
      subject: 'ได้รับคำตอบการปรึกษาจากโรงพยาบาล',
      html: `
<div style="width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;">
    <!-- Top Pink Line -->
    <div style="background-color: #F15BFF; height: 4px; width: 100%;"></div>
    
    <!-- Main Content -->
    <div style="background-color: #ffffff; border-left: 1px solid #E5E5E5; border-right: 1px solid #E5E5E5; border-bottom: 1px solid #E5E5E5;">
      <!-- Logo and Title Section -->
      <div style="padding: 40px 32px 0 32px;">
        <!-- Title -->
        <h1 style="margin: 0; padding: 0; font-size: 30px; line-height: 36px; font-weight: 600; color: #404040;">
          <span style="color: #F15BFF;">คำตอบ</span>จาก${hospitalName}<br/>
          มาถึงแล้ว
        </h1>
        
        <!-- Description -->
        <div style="margin-top: 12px; font-size: 18px; line-height: 28px; color: #737373; font-weight: 400;">
          <p style="margin: 0 0 8px 0;">คุณสามารถตรวจสอบคำตอบการปรึกษาจากโรงพยาบาลและดำเนินการปรึกษาเพิ่มเติมหรือนัดหมายต่อได้</p>
          <p style="margin: 0;">กรุณาคลิกปุ่มด้านล่างเพื่อดูรายละเอียดคำตอบ</p>
        </div>
      </div>
      
      <!-- Button -->
      <div style="padding: 40px 32px; text-align: center;">
        <a href="${chatUrl}" style="display: inline-block; background-color: #7657FF; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; line-height: 28px; font-weight: 500;">
          ดูคำตอบ
        </a>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #F5F5F5; padding: 32px; color: #A3A3A3; font-size: 14px; line-height: 20px;">
        <p style="margin: 0 0 16px 0;">นี่คืออีเมลอัตโนมัติ กรุณาอย่าตอบกลับ<br/>
        หากมีคำถาม กรุณาติดต่อ <span style="text-decoration: underline;">cs@k-doc.kr</span></p>
        <p style="margin: 0;">COPYRIGHT © K-DOC. ALL RIGHT RESERVED</p>
      </div>
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
