/**
 * App Store 메타데이터 기준표 (제목·서브타이틀·소개문구)
 * API locale은 ko-KR, en-US 등; 비교 시 baseline 키는 locale.replace(/-/g, '_') 로 매칭
 */

export interface LocaleMetadata {
  name: string;
  subtitle: string;
  description: string;
}

/** 로케일 키: API의 locale (예: ko-KR) → replace(/-/g, '_') 한 값으로 조회 */
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
  },
  en_US: {
    name: "K-DOC : Connect Top Korea Clinics",
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
  },
  hi_IN: {
    name: 'K-DOC : कोरिया के शीर्ष क्लीनिकों से जुड़ें',
    subtitle:
      'कोरिया के शीर्ष क्लीनिकों की तुलना करें, बुक करें और परामर्श लें',
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
  },
  ar_SA: {
    name: 'K-DOC : تواصل مع أفضل العيادات في كوريا',
    subtitle: '',
    description: '',
  },
  ru_RU: {
    name: '',
    subtitle: '',
    description: '',
  },
};

/** API locale (e.g. ko-KR) → baseline 키 (e.g. ko_KR) */
export function apiLocaleToBaselineKey(apiLocale: string): string {
  return apiLocale.replace(/-/g, '_');
}
