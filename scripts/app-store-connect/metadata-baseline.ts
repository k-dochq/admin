/**
 * App Store 메타데이터 기준표
 * - 앱 레벨(App Info Localizations): name, subtitle
 * - 버전 레벨(App Store Version Localizations): description, whatsNew
 *
 * API locale 예:
 * - ko, en-US, ja, th, hi, zh-Hant
 *
 * baseline 키:
 * - apiLocaleToBaselineKey()에서 '-' → '_' 변환
 * - 그리고 일부 locale은 region이 생략될 수 있어서(ko vs ko-KR) 별도 매핑을 둠
 */

export interface LocaleMetadata {
  name: string; // App Info Localization
  subtitle: string; // App Info Localization
  description: string; // Version Localization
  whatsNew: string; // Version Localization
}

/**
 * locale 매핑:
 * - App Store Connect API에서 locale이 "th" / "ko"처럼 region 없이 올 수 있음
 * - zh-Hant도 zh_Hant_TW로 관리한다는 전제(당신 baseline)로 매핑
 */
export function apiLocaleToBaselineKey(apiLocale: string): string {
  const s = (apiLocale ?? '').trim();

  // exact fast-path
  if (!s) return s;

  // normalize known short forms -> your baseline keys
  const lower = s.toLowerCase();

  if (lower === 'ko') return 'ko_KR';
  if (lower === 'ja') return 'ja_JP';
  if (lower === 'th') return 'th_TH';
  if (lower === 'hi') return 'hi_IN';
  if (lower === 'ar') return 'ar_SA';
  if (lower === 'ru') return 'ru_RU';

  // Chinese Traditional can show as zh-Hant (no region) in API
  if (lower === 'zh-hant') return 'zh_Hant_TW';

  // Default: hyphen -> underscore (e.g. en-US -> en_US)
  return s.replace(/-/g, '_');
}

// 공통 릴리즈 노트(영문은 요청대로 내가 적당히 “무난한” 스타일로 생성)
const WHATS_NEW = {
  ko: `성능 및 안정성 개선
예약·상담 흐름 개선
UI/UX 개선 및 소소한 버그 수정`,
  en: `Performance and stability improvements
Smoother booking and consultation flow
UI/UX refinements and minor bug fixes`,
  ja: `パフォーマンスと安定性を改善
予約・相談フローをよりスムーズに改善
UI/UXの調整と軽微な不具合修正`,
  th: `ปรับปรุงประสิทธิภาพและความเสถียรของระบบ
ทำให้ขั้นตอนการจองและการปรึกษาราบรื่นยิ่งขึ้น
ปรับปรุง UI/UX และแก้ไขบั๊กเล็กน้อย`,
  hi: `प्रदर्शन और स्थिरता में सुधार
बुकिंग और परामर्श प्रक्रिया को अधिक सहज बनाया
UI/UX में सुधार और छोटे बग्स का समाधान`,
  zhHant: `效能與穩定性提升
預約與諮詢流程更順暢
UI/UX 優化與小幅錯誤修正`,
};

export const METADATA_BASELINE: Record<string, LocaleMetadata> = {
  ko_KR: {
    name: 'K-DOC : 한국 상위 병원을 연결합니다',
    subtitle: '한국 상위 병원을 비교하고 예약·상담하세요',
    description: `한국 성형외과 & 피부과 정보를 한눈에 비교하고 예약하세요!

신뢰할 수 있는 실제 리뷰부터 실시간 예약까지, 한 곳에서 가능합니다.

**K-DOC은 한국 정부의 심사를 거쳐 외국인 환자 유치업 허가를 취득한 정식 등록 의료 플랫폼입니다.**

병원 비교부터 상담과 예약은 물론, 통역 · 차량 지원 · VIP 의전 · 사후케어까지 모든 과정을 앱 하나로 제공합니다.

**주요 기능**

• 한국 상위 10% 검증된 병원 정보 제공

• 실제 시술 기반 리뷰 확인

• 모바일 간편 예약 & 글로벌 다국어 지원

→ 한국 성형 여행, 이제 K-DOC으로 안전하고 합리적으로 시작하세요!`,
    whatsNew: WHATS_NEW.ko,
  },

  en_US: {
    name: 'K-DOC : Connect Top Korea Clinics',
    subtitle: "Compare, book & consult Korea's Top Clinics",
    description: `Compare and book top Korean plastic surgery and dermatology clinics at a glance.

From trusted, real patient reviews to real-time reservations, everything is available in one place.

**K-DOC is an officially registered medical platform, fully licensed by the Korean government to attract and support international patients.**

From clinic comparison to consultation and booking, as well as interpretation services, transportation support, VIP care, and post-treatment follow-up every step of your medical journey is seamlessly managed through a single app.

**Key Features**

• Access to information on Korea's top 10% verified clinics

• Real, procedure-based patient reviews

• Easy mobile booking with global multilingual support

→ Start your Korean medical journey safely and confidently with K-DOC.`,
    whatsNew: WHATS_NEW.en,
  },

  th_TH: {
    name: 'K-DOC : เชื่อมต่อคลินิกชั้นนำในเกาหลี',
    subtitle: 'เปรียบเทียบ จอง และปรึกษาคลินิกชั้นนำของเกาหลี',
    description: `คลินิกศัลยกรรมตกแต่งและผิวหนังชั้นนำของเกาหลี

**เปรียบเทียบและจองได้ในที่เดียวอย่างง่ายดาย**

ตั้งแต่รีวิวจากผู้ป่วยจริงที่เชื่อถือได้

ไปจนถึงการจองแบบเรียลไทม์ ทุกอย่างรวมไว้ครบในที่เดียว

**K-DOC เป็นแพลตฟอร์มทางการแพทย์ที่จดทะเบียนอย่างถูกต้อง**

**และได้รับอนุญาตจากรัฐบาลเกาหลีอย่างเป็นทางการ**

**เพื่อให้บริการและสนับสนุนผู้ป่วยชาวต่างชาติ**

ตั้งแต่การเปรียบเทียบคลินิก การปรึกษา และการจอง

รวมถึงบริการล่าม การรับ-ส่ง การดูแลแบบ VIP

และการติดตามผลหลังการรักษา

ทุกขั้นตอนของการเดินทางทางการแพทย์ของคุณ

สามารถจัดการได้อย่างราบรื่นผ่านแอปเดียว

**คุณสมบัติเด่น**

- เข้าถึงข้อมูลคลินิกชั้นนำของเกาหลีที่ผ่านการคัดเลือกและตรวจสอบแล้ว (Top 10%)
- รีวิวจากผู้ป่วยจริง อ้างอิงตามหัตถการจริง
- จองง่ายผ่านมือถือ พร้อมรองรับหลายภาษาในระดับสากล

→ เริ่มต้นการเดินทางด้านการแพทย์ในเกาหลี

อย่างปลอดภัยและมั่นใจไปกับ K-DOC`,
    whatsNew: WHATS_NEW.th,
  },

  zh_Hant_TW: {
    name: 'K-DOC : 連結韓國頂級醫療機構',
    subtitle: '比較、預約並諮詢韓國頂級醫療機構',
    description: `一站式比較並預約

**韓國頂尖整形外科與皮膚科診所。**

從**真實、可信的患者評價**到**即時預約服務**，所有醫療資訊與流程，**一次掌握於同一平台。**

**K-DOC 為依據韓國政府法規正式註冊的醫療平台，具備合法資格，專為國際患者提供醫療引介與全方位支援。**

從診所比較、諮詢與預約，到**專業口譯、交通支援、VIP 禮賓服務**，以及療程後的追蹤照護，您醫療旅程的每一個環節，皆可透過 **一個 App** 無縫完成。

### **主要功能**

- 提供韓國 **前 10% 通過嚴格驗證的頂尖診所**資訊
- 以實際療程為基礎的 **真實患者評價**
- 支援多國語言的 **行動裝置即時預約服務**

→ 透過 **K-DOC**，

安心、放心地展開您的 **韓國醫療之旅**。`,
    whatsNew: WHATS_NEW.zhHant,
  },

  ja_JP: {
    name: 'K-DOC : 韓国のトップクリニックとつながる',
    subtitle: '韓国のトップクリニックを比較・予約・相談',
    description: `韓国の美容外科・皮膚科クリニックを

**ひと目で比較・予約。**

信頼できる実際の患者レビューから、**リアルタイム予約**まで、すべてを**一つのプラットフォーム**で。

**K-DOCは、韓国政府に正式登録された医療プラットフォームとして、外国人患者の誘致およびサポートを行う認可を取得しています。**

クリニック比較、カウンセリング、予約はもちろん、**医療通訳、送迎サポート、VIPケア、施術後のフォローアップ**まで。

医療の旅のすべてを、**一つのアプリで一元管理**します。

### **主な特長**

- 韓国トップ10％の**厳選・検証済みクリニック情報**
- **施術ベースの実体験レビュー**
- **多言語対応**のかんたんモバイル予約

→ **K-DOCで、安心・安全に韓国医療の旅を始めましょう。**`,
    whatsNew: WHATS_NEW.ja,
  },

  hi_IN: {
    name: 'K-DOC : कोरिया के शीर्ष क्लीनिकों से जुड़ें',
    subtitle: 'कोरिया के शीर्ष क्लीनिकों की तुलना करें, बुक करें और परामर्श लें',
    description: `कोरिया के शीर्ष प्लास्टिक सर्जरी और डर्मेटोलॉजी क्लिनिकों की

तुलना करें और एक नज़र में बुकिंग करें।

विश्वसनीय वास्तविक मरीजों की समीक्षाओं से लेकर

रियल-टाइम आरक्षण तक—

सभी सेवाएँ एक ही प्लेटफ़ॉर्म पर उपलब्ध हैं।

**K-DOC एक आधिकारिक रूप से पंजीकृत मेडिकल प्लेटफ़ॉर्म है,**

**जिसे कोरियाई सरकार द्वारा अंतरराष्ट्रीय मरीजों को आकर्षित करने**

**और सहायता प्रदान करने के लिए पूर्ण लाइसेंस प्राप्त है।**

क्लिनिक तुलना से लेकर परामर्श और बुकिंग तक,

साथ ही दुभाषिया सेवा, परिवहन सहायता,

VIP केयर और उपचार के बाद फॉलो-अप तक—

आपकी पूरी मेडिकल यात्रा को

एक ही ऐप के माध्यम से सहज रूप से प्रबंधित किया जाता है।

### **मुख्य विशेषताएँ**

- कोरिया के शीर्ष 10% सत्यापित क्लिनिकों की जानकारी तक पहुँच
- वास्तविक प्रक्रियाओं पर आधारित मरीज समीक्षाएँ
- वैश्विक बहुभाषी समर्थन के साथ आसान मोबाइल बुकिंग

→ **K-DOC के साथ अपनी कोरियाई मेडिकल यात्रा**

**सुरक्षित और आत्मविश्वास के साथ शुरू करें।**`,
    whatsNew: WHATS_NEW.hi,
  },

  ar_SA: {
    name: 'K-DOC : تواصل مع أفضل العيادات في كوريا',
    subtitle: 'قارن واحجز واستشر أفضل عيادات كوريا',
    description: `قارن واحجز أفضل عيادات جراحة التجميل والجلدية في كوريا بكل سهولة.
  
  من مراجعات موثوقة مبنية على تجارب حقيقية إلى الحجوزات الفورية—كل شيء في مكان واحد.
  
  **K-DOC منصة طبية مسجلة رسميًا ومرخصة من الحكومة الكورية لدعم المرضى الدوليين.**
  
  ابتداءً من مقارنة العيادات والاستشارة والحجز، وصولاً إلى خدمات الترجمة والدعم في التنقل وخدمة VIP والمتابعة بعد العلاج—يمكنك إدارة رحلتك الطبية بالكامل عبر تطبيق واحد.
  
  **الميزات الرئيسية**
  
  • معلومات عن أفضل 10% من العيادات التي تم التحقق منها في كوريا  
  • مراجعات حقيقية مبنية على إجراءات فعلية  
  • حجز سهل عبر الجوال مع دعم متعدد اللغات عالميًا  
  
  → ابدأ رحلتك الطبية في كوريا بأمان وثقة مع K-DOC.`,
    whatsNew: `تحسينات في الأداء والاستقرار
  تجربة أكثر سلاسة للحجز والاستشارة
  تحسينات على واجهة المستخدم وإصلاحات بسيطة`,
  },
  ru_RU: {
    name: 'K-DOC: Лучшие клиники Кореи',
    subtitle: 'Сравнивайте, бронируйте и консультируйтесь',
    description: `Сравнивайте и бронируйте ведущие клиники пластической хирургии и дерматологии в Корее в одном приложении.
  
  От проверенных отзывов реальных пациентов до онлайн-записи в реальном времени — всё в одном месте.
  
  **K-DOC — официально зарегистрированная медицинская платформа, лицензированная правительством Кореи для поддержки иностранных пациентов.**
  
  Сравнение клиник, консультации и бронирование, а также перевод, помощь с транспортом, VIP-сопровождение и пост-уход — все этапы вашей медицинской поездки можно удобно управлять через одно приложение.
  
  **Ключевые возможности**
  
  • Доступ к информации о топ-10% проверенных клиник Кореи  
  • Реальные отзывы на основе проведённых процедур  
  • Удобное бронирование с многоязычной поддержкой  
  
  → Начните медицинскую поездку в Корею безопасно и уверенно вместе с K-DOC.`,
    whatsNew: `Улучшения производительности и стабильности
  Более плавный процесс бронирования и консультаций
  Обновления UI/UX и небольшие исправления`,
  },
};
