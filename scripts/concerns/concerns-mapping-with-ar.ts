/**
 * 고민부위 매핑 정보 (아랍어 ar_SA 포함)
 * 카테고리별 한국어 고민부위 → 각 언어별 번역 매핑 (ar_SA 추가)
 */

export type ConcernLocaleWithAr =
  | 'en_US'
  | 'th_TH'
  | 'zh_TW'
  | 'ja_JP'
  | 'hi_IN'
  | 'tl_PH'
  | 'ar_SA';

export interface ConcernMappingWithAr {
  category: string;
  ko_KR: string;
  en_US: string;
  th_TH: string;
  zh_TW: string;
  ja_JP: string;
  hi_IN: string;
  tl_PH: string;
  ar_SA: string;
}

/** 아랍어 컬럼 값 정규화: 끝의 # 제거 후 앞에 # 붙여 다른 로케일과 형식 통일 */
function normalizeArSa(value: string): string {
  const s = value.trim().replace(/#$/g, '');
  return s ? (s.startsWith('#') ? s : `#${s}`) : '';
}

export const CONCERN_MAPPINGS_WITH_AR: ConcernMappingWithAr[] = [
  { category: '가슴', ko_KR: '#가슴거상술', en_US: '#BreastLift', th_TH: '#ยกกระชับหน้าอก', zh_TW: '#乳房拉提', ja_JP: '#バストリフト', hi_IN: '#स्तनउठान', tl_PH: '#BreastLift', ar_SA: normalizeArSa('شد_الثدي#') },
  { category: '가슴', ko_KR: '#가슴재수술', en_US: '#BreastRevisionSurgery', th_TH: '#ผ่าตัดแก้หน้าอก', zh_TW: '#乳房修復手術', ja_JP: '#胸再手術', hi_IN: '#BreastRevisionSurgery', tl_PH: '#BreastRevisionSurgery', ar_SA: normalizeArSa('إعادة_جراحة_الثدي#') },
  { category: '가슴', ko_KR: '#가슴확대(보형물)', en_US: '#Breast Implants', th_TH: '#เสริมหน้าอกซิลิโคน', zh_TW: '#隆乳手術(假體)', ja_JP: '#豊胸手術(インプラント)', hi_IN: '#Breast Implants', tl_PH: '#Breast Implants', ar_SA: normalizeArSa('تكبير_الثدي_(زرع_حشوات)#') },
  { category: '가슴', ko_KR: '#가슴확대(지방이식)', en_US: '#Breast fat grafting', th_TH: '#เสริมหน้าอกด้วยไขมันตัวเอง', zh_TW: '#自體脂肪隆乳', ja_JP: '#脂肪注入豊胸', hi_IN: '#Breast fat grafting', tl_PH: '#Breast fat grafting', ar_SA: normalizeArSa('تكبير_الثدي_(نقل_الدهون)#') },
  { category: '거상', ko_KR: '#미니거상', en_US: '#MiniFacelift', th_TH: '#มินิเฟซลิฟต์', zh_TW: '#迷你拉提', ja_JP: '#ミニリフト', hi_IN: '#मिनीफेसलिफ्ट', tl_PH: '#MiniFacelift', ar_SA: normalizeArSa('MiniFacelift#') },
  { category: '거상', ko_KR: '#안면거상', en_US: '#Face lift', th_TH: '#ผ่าตัดดึงหน้า', zh_TW: '#拉皮手術', ja_JP: '#フェイスリフト', hi_IN: '#Face lift', tl_PH: '#Face lift', ar_SA: normalizeArSa('Face lift#') },
  { category: '거상', ko_KR: '#이마거상', en_US: '#Forehead lift', th_TH: '#ผ่าตัดยกหน้าผาก', zh_TW: '#前額拉皮', ja_JP: '#額リフト', hi_IN: '#Forehead lift', tl_PH: '#Forehead lift', ar_SA: normalizeArSa('Forehead lift#') },
  { category: '기타쁘띠', ko_KR: '#백옥주사', en_US: '#GlutathioneInjection', th_TH: '#ฉีดกลูตาไธโอน', zh_TW: '#白玉注射', ja_JP: '#白玉注射', hi_IN: '#ग्लूटाथायोनइंजेक्शन', tl_PH: '#GlutathioneInjection', ar_SA: normalizeArSa('GlutathioneInjection#') },
  { category: '기타쁘띠', ko_KR: '#비타민주사', en_US: '#VitaminInjection', th_TH: '#ฉีดวิตามิน', zh_TW: '#維他命注射', ja_JP: '#ビタミン注射', hi_IN: '#विटामिनइंजेक्शन', tl_PH: '#VitaminInjection', ar_SA: normalizeArSa('VitaminInjection#') },
  { category: '기타쁘띠', ko_KR: '#수액주사', en_US: '#IVDrip', th_TH: '#น้ำเกลือทางหลอดเลือด', zh_TW: '#靜脈點滴', ja_JP: '#点滴注射', hi_IN: '#आईवीड्रिप', tl_PH: '#IVDrip', ar_SA: normalizeArSa('IVDrip#') },
  { category: '기타쁘띠', ko_KR: '#신데렐라주사', en_US: '#CinderellaInjection', th_TH: '#ซินเดอเรลล่าอินเจคชั่น', zh_TW: '#灰姑娘注射', ja_JP: '#シンデレラ注射', hi_IN: '#सिंड्रेला इंजेक्शन', tl_PH: '#CinderellaInjection', ar_SA: normalizeArSa('CinderellaInjection#') },
  { category: '기타쁘띠', ko_KR: '#윤곽주사', en_US: '#FaceContouringInjection', th_TH: '#ฉีดปรับรูปหน้า', zh_TW: '#輪廓針', ja_JP: '#輪郭注射', hi_IN: '#फेसकॉन्टूरिंगइंजेक्शन', tl_PH: '#FaceContouringInjection', ar_SA: normalizeArSa('FaceContouringInjection#') },
  { category: '기타쁘띠', ko_KR: '#점제거시술', en_US: '#MoleRemoval', th_TH: '#กำจัดไฝ', zh_TW: '#除痣', ja_JP: '#ほくろ除去', hi_IN: '#तिलहटाना', tl_PH: '#MoleRemoval', ar_SA: normalizeArSa('MoleRemoval#') },
  { category: '눈', ko_KR: '#눈꺼풀지방이식', en_US: '#EyelidFatGrafting', th_TH: '#เติมไขมันเปลือกตา', zh_TW: '#眼瞼脂肪移植', ja_JP: '#まぶた脂肪移植', hi_IN: '#पलकमेंफैटग्राफ्टिंग', tl_PH: '#EyelidFatGrafting', ar_SA: normalizeArSa('EyelidFatGrafting#') },
  { category: '눈', ko_KR: '#눈꺼풀지방제거', en_US: '#EyelidFatRemoval', th_TH: '#กำจัดไขมันเปลือกตา', zh_TW: '#眼瞼脂肪去除', ja_JP: '#まぶた脂肪除去', hi_IN: '#पलककीचर्बीहटाना', tl_PH: '#EyelidFatRemoval', ar_SA: normalizeArSa('EyelidFatRemoval#') },
  { category: '눈', ko_KR: '#눈매교정', en_US: '#EyeShapeCorrection', th_TH: '#ปรับรูปตา', zh_TW: '#眼型矯正', ja_JP: '#目元矯正', hi_IN: '#आंखोंकीआकृतिसुधार', tl_PH: '#EyeShapeCorrection', ar_SA: normalizeArSa('EyeShapeCorrection#') },
  { category: '눈', ko_KR: '#눈매교정(부분절개)', en_US: '#PtosisCorrection(PartialIncision)', th_TH: '#แก้ไขกล้ามเนื้อตาแบบกรีดบางส่วน', zh_TW: '#提眼肌矯正(部分切開)', ja_JP: '#眼瞼下垂手術(部分切開)', hi_IN: '#PtosisCorrection(PartialIncision)', tl_PH: '#PtosisCorrection(PartialIncision)', ar_SA: normalizeArSa('PtosisCorrection(PartialIncision)#') },
  { category: '눈', ko_KR: '#눈매교정(비절개)', en_US: '#PtosisCorrection(NonIncisional)', th_TH: '#ปรับรูปตา(ไม่ผ่าตัด)', zh_TW: '#提眼肌矯正(非切開)', ja_JP: '#眼瞼下垂手術(非切開)', hi_IN: '#आंखोंकीआकृतिसुधार(नॉनइंसिजनल)', tl_PH: '#PtosisCorrection(NonIncisional)', ar_SA: normalizeArSa('PtosisCorrection(NonIncisional)#') },
  { category: '눈', ko_KR: '#눈매교정(절개)', en_US: '#PtosisCorrection(Incisional)', th_TH: '#แก้ไขกล้ามเนื้อตาแบบกรีด', zh_TW: '#提眼肌矯正(切開式)', ja_JP: '#眼瞼下垂手術(切開法)', hi_IN: '#PtosisCorrection(Incisional)', tl_PH: '#PtosisCorrection(Incisional)', ar_SA: normalizeArSa('PtosisCorrection(Incisional)#') },
  { category: '눈', ko_KR: '#눈밑지방이식', en_US: '#UnderEyeFatGrafting', th_TH: '#การเติมไขมันใต้ตา', zh_TW: '#下眼瞼脂肪移植', ja_JP: '#下眼脂肪移植', hi_IN: '#UnderEyeFatGrafting', tl_PH: '#UnderEyeFatGrafting', ar_SA: normalizeArSa('UnderEyeFatGrafting#') },
  { category: '눈', ko_KR: '#눈밑지방재배치', en_US: '#UnderEyeFatRepositioning', th_TH: '#การจัดเรียงไขมันใต้ตา', zh_TW: '#下眼瞼脂肪重新配置', ja_JP: '#下眼脂肪再配置', hi_IN: '#UnderEyeFatRepositioning', tl_PH: '#UnderEyeFatRepositioning', ar_SA: normalizeArSa('UnderEyeFatRepositioning#') },
  { category: '눈', ko_KR: '#눈밑지방제거', en_US: '#UnderEyeFatRemoval', th_TH: '#กำจัดไขมันใต้ตา', zh_TW: '#下眼瞼脂肪去除', ja_JP: '#下眼脂肪除去', hi_IN: '#आंखोंकेनीचेकीचर्बीहटाना', tl_PH: '#UnderEyeFatRemoval', ar_SA: normalizeArSa('UnderEyeFatRemoval#') },
  { category: '눈', ko_KR: '#눈재수술', en_US: '#RevisionEyeSurgery', th_TH: '#แก้ไขตาสองชั้น', zh_TW: '#眼部修復手術', ja_JP: '#目元再手術', hi_IN: '#RevisionEyeSurgery', tl_PH: '#RevisionEyeSurgery', ar_SA: normalizeArSa('RevisionEyeSurgery#') },
  { category: '눈', ko_KR: '#뒷트임', en_US: '#LateralCanthoplasty', th_TH: '#เปิดหางตา', zh_TW: '#開眼尾', ja_JP: '#目尻切開', hi_IN: '#LateralCanthoplasty', tl_PH: '#LateralCanthoplasty', ar_SA: normalizeArSa('LateralCanthoplasty#') },
  { category: '눈', ko_KR: '#밑트임', en_US: '#LowerCanthoplasty', th_TH: '#เปิดหางตาล่าง', zh_TW: '#下眼尾開大', ja_JP: '#下眼瞼下制術', hi_IN: '#LowerCanthoplasty', tl_PH: '#LowerCanthoplasty', ar_SA: normalizeArSa('LowerCanthoplasty#') },
  { category: '눈', ko_KR: '#쌍커풀(매몰)', en_US: '#DoubleEyelid(Non-Incisional)', th_TH: '#ตาสองชั้นแบบไม่กรีด', zh_TW: '#雙眼皮(縫合式)', ja_JP: '#二重まぶた(埋没法)', hi_IN: '#DoubleEyelid(Non-Incisional)', tl_PH: '#DoubleEyelid(Non-Incisional)', ar_SA: normalizeArSa('DoubleEyelid(Non-Incisional)#') },
  { category: '눈', ko_KR: '#쌍커풀(부분절개)', en_US: '#DoubleEyelid(PartialIncision)', th_TH: '#ตาสองชั้นแบบกรีดบางส่วน', zh_TW: '#雙眼皮(部分切開)', ja_JP: '#二重まぶた(部分切開)', hi_IN: '#DoubleEyelid(PartialIncision)', tl_PH: '#DoubleEyelid(PartialIncision)', ar_SA: normalizeArSa('DoubleEyelid(PartialIncision)#') },
  { category: '눈', ko_KR: '#쌍커풀(자연유착)', en_US: '#DoubleEyelid(NaturalAdhesion)', th_TH: '#ตาสองชั้นแบบยึดธรรมชาติ', zh_TW: '#雙眼皮(自然癒合)', ja_JP: '#二重まぶた(自然癒着)', hi_IN: '#DoubleEyelid(NaturalAdhesion)', tl_PH: '#DoubleEyelid(NaturalAdhesion)', ar_SA: normalizeArSa('DoubleEyelid(NaturalAdhesion)#') },
  { category: '눈', ko_KR: '#쌍커풀(절개)', en_US: '#DoubleEyelid(Incisional)', th_TH: '#ตาสองชั้นแบบกรีด', zh_TW: '#雙眼皮(切開式)', ja_JP: '#二重まぶた(切開法)', hi_IN: '#DoubleEyelid(Incisional)', tl_PH: '#DoubleEyelid(Incisional)', ar_SA: normalizeArSa('DoubleEyelid(Incisional)#') },
  { category: '눈', ko_KR: '#앞트임', en_US: '#Epicanthoplasty', th_TH: '#เปิดหัวตา', zh_TW: '#開眼頭', ja_JP: '#目頭切開', hi_IN: '#Epicanthoplasty', tl_PH: '#Epicanthoplasty', ar_SA: normalizeArSa('Epicanthoplasty#') },
  { category: '눈', ko_KR: '#윗트임', en_US: '#UpperCanthoplasty', th_TH: '#เปิดหัวตาบน', zh_TW: '#上眼頭矯正', ja_JP: '#上眼瞼切開', hi_IN: '#UpperCanthoplasty', tl_PH: '#UpperCanthoplasty', ar_SA: normalizeArSa('UpperCanthoplasty#') },
  { category: '눈', ko_KR: '#하안검', en_US: '#LowerBlepharoplasty', th_TH: '#ศัลยกรรมเปลือกตาล่าง', zh_TW: '#下眼瞼手術', ja_JP: '#下眼瞼形成術', hi_IN: '#निचलीपलकसर्जरी', tl_PH: '#LowerBlepharoplasty', ar_SA: normalizeArSa('LowerBlepharoplasty#') },
  { category: '다이어트', ko_KR: '#다이어트약', en_US: '#DietPill', th_TH: '#ยาลดน้ำหนัก', zh_TW: '#減肥藥', ja_JP: '#ダイエット薬', hi_IN: '#वजनघटानेकीदवा', tl_PH: '#DietPill', ar_SA: normalizeArSa('DietPill#') },
  { category: '다이어트', ko_KR: '#위고비', en_US: '#Wegovy', th_TH: '#Wegovy', zh_TW: '#Wegovy', ja_JP: '#Wegovy', hi_IN: '#Wegovy', tl_PH: '#Wegovy', ar_SA: normalizeArSa('Wegovy#') },
  { category: '레이저리프팅', ko_KR: '#레이저리프팅', en_US: '#LaserLifting', th_TH: '#เลเซอร์ยกกระชับผิว', zh_TW: '#雷射拉提', ja_JP: '#レーザーリフト', hi_IN: '#LaserLifting', tl_PH: '#LaserLifting', ar_SA: normalizeArSa('LaserLifting#') },
  { category: '레이저리프팅', ko_KR: '#볼륨리프팅', en_US: '#VolumeLifting', th_TH: '#วอลลุ่มลิฟติ้ง', zh_TW: '#立體拉提', ja_JP: '#ボリュームリフト', hi_IN: '#VolumeLifting', tl_PH: '#VolumeLifting', ar_SA: normalizeArSa('VolumeLifting#') },
  { category: '레이저리프팅', ko_KR: '#슈링크리프팅', en_US: '#ShurinkLifting', th_TH: '#ShurinkLifting', zh_TW: '#Shurink拉提', ja_JP: '#シュリンクリフティング', hi_IN: '#ShurinkLifting', tl_PH: '#ShurinkLifting', ar_SA: normalizeArSa('ShurinkLifting#') },
  { category: '레이저리프팅', ko_KR: '#온다리프팅', en_US: '#OndaLifting', th_TH: '#ออนดาลิฟติ้ง', zh_TW: '#ONDA拉提', ja_JP: '#オンダリフト', hi_IN: '#OndaLifting', tl_PH: '#OndaLifting', ar_SA: normalizeArSa('OndaLifting#') },
  { category: '레이저리프팅', ko_KR: '#울쎄라', en_US: '#Ultherapy', th_TH: '#Ultherapy', zh_TW: '#Ultherapy', ja_JP: '#Ultherapy', hi_IN: '#Ultherapy', tl_PH: '#Ultherapy', ar_SA: normalizeArSa('Ultherapy#') },
  { category: '레이저리프팅', ko_KR: '#인모드리프팅', en_US: '#InModeLifting', th_TH: '#อินโหมดลิฟติ้ง', zh_TW: '#InMode拉提', ja_JP: '#インモードリフト', hi_IN: '#InModeLifting', tl_PH: '#InModeLifting', ar_SA: normalizeArSa('InModeLifting#') },
  { category: '레이저리프팅', ko_KR: '#튠페이스', en_US: '#TuneFace', th_TH: '#ทูนเฟซ', zh_TW: '#TuneFace', ja_JP: '#チューンフェイス', hi_IN: '#TuneFace', tl_PH: '#TuneFace', ar_SA: normalizeArSa('TuneFace#') },
  { category: '리프팅', ko_KR: '#리프팅', en_US: '#SkinLifting', th_TH: '#ยกกระชับผิว', zh_TW: '#拉提', ja_JP: '#リフトアップ', hi_IN: '#SkinLifting', tl_PH: '#SkinLifting', ar_SA: normalizeArSa('SkinLifting#') },
  { category: '리프팅', ko_KR: '#목리프팅', en_US: '#NeckLifting', th_TH: '#ยกกระชับลำคอ', zh_TW: '#頸部拉提', ja_JP: '#ネックリフト', hi_IN: '#गर्दनलिफ्ट', tl_PH: '#NeckLifting', ar_SA: normalizeArSa('NeckLifting#') },
  { category: '리프팅', ko_KR: '#실리프팅', en_US: '#Thread lift', th_TH: '#การร้อยไหม', zh_TW: '#線雕拉提', ja_JP: '#糸リフト', hi_IN: '#थ्रेड लिफ्ट', tl_PH: '#Thread lift', ar_SA: normalizeArSa('Thread lift#') },
  { category: '모발', ko_KR: '#모발이식(비절개)', en_US: '#HairTransplant(NonIncisional)', th_TH: '#ปลูกผม(ไม่ผ่าตัด)', zh_TW: '#植髮(非切開式)', ja_JP: '#植毛(非切開)', hi_IN: '#बालप्रत्यारोपण(नॉनइंसिजनल)', tl_PH: '#HairTransplant(NonIncisional)', ar_SA: normalizeArSa('HairTransplant(NonIncisional)#') },
  { category: '모발', ko_KR: '#모발이식(절개)', en_US: '#HairTransplant(Incisional)', th_TH: '#ปลูกผม(ผ่าตัด)', zh_TW: '#植髮(切開式)', ja_JP: '#植毛(切開式)', hi_IN: '#बालप्रत्यारोपण(चीरा)', tl_PH: '#HairTransplant(Incisional)', ar_SA: normalizeArSa('HairTransplant(Incisional)#') },
  { category: '모발', ko_KR: '#이마축소', en_US: '#ForeheadReduction', th_TH: '#ลดขนาดหน้าผาก', zh_TW: '#額頭縮小', ja_JP: '#額縮小', hi_IN: '#ForeheadReduction', tl_PH: '#ForeheadReduction', ar_SA: normalizeArSa('تصغير_الجبهة#') },
  { category: '보톡스', ko_KR: '#미간보톡스', en_US: '#GlabellarBotox', th_TH: '#โบท็อกซ์ระหว่างคิ้ว', zh_TW: '#眉間肉毒', ja_JP: '#眉間ボトックス', hi_IN: '#ग्लैबेलरबोटॉक्स', tl_PH: '#GlabellarBotox', ar_SA: normalizeArSa('بوتوكس_بين_الحاجبين#') },
  { category: '보톡스', ko_KR: '#보톡스', en_US: '#Botox', th_TH: '#โบท็อกซ์', zh_TW: '#肉毒桿菌', ja_JP: '#ボトックス', hi_IN: '#बोटॉक्स', tl_PH: '#Botox', ar_SA: normalizeArSa('بوتوكس#') },
  { category: '보톡스', ko_KR: '#사각턱보톡스', en_US: '#MasseterBotox', th_TH: '#โบท็อกซ์กราม', zh_TW: '#咬肌肉毒', ja_JP: '#エラボトックス', hi_IN: '#MasseterBotox', tl_PH: '#MasseterBotox', ar_SA: normalizeArSa('بوتوكس_الفك_المربع#') },
  { category: '보톡스', ko_KR: '#승모근보톡스', en_US: '#TrapeziusBotox', th_TH: '#โบท็อกซ์กล้ามเนื้อบ่า', zh_TW: '#斜方肌肉毒', ja_JP: '#僧帽筋ボトックス', hi_IN: '#ट्रेपेज़ियसबोटॉक्स', tl_PH: '#TrapeziusBotox', ar_SA: normalizeArSa('بوتوكس_الترابيس#') },
  { category: '보톡스', ko_KR: '#얼굴보톡스', en_US: '#FacialBotox', th_TH: '#โบท็อกซ์หน้า', zh_TW: '#臉部肉毒', ja_JP: '#顔ボトックス', hi_IN: '#फेशियलबोटॉक्स', tl_PH: '#FacialBotox', ar_SA: normalizeArSa('بوتوكس_الوجه#') },
  { category: '보톡스', ko_KR: '#입꼬리보톡스', en_US: '#MouthCornerBotox', th_TH: '#โบท็อกซ์มุมปาก', zh_TW: '#嘴角肉毒', ja_JP: '#口角ボトックス', hi_IN: '#माउथकॉर्नरबोटॉक्स', tl_PH: '#MouthCornerBotox', ar_SA: normalizeArSa('بوتوكس_زاوية_الفم#') },
  { category: '안면윤곽', ko_KR: '#광대축소', en_US: '#ZygomaReduction', th_TH: '#ลดโหนกแก้ม', zh_TW: '#顴骨縮小', ja_JP: '#頬骨縮小', hi_IN: '#ZygomaReduction', tl_PH: '#ZygomaReduction', ar_SA: normalizeArSa('تصغير_عظام_الوجنتين#') },
  { category: '안면윤곽', ko_KR: '#돌출입교정', en_US: '#ProtrudingMouthCorrection', th_TH: '#แก้ไขปากยื่น', zh_TW: '#突嘴矯正', ja_JP: '#口元突出矯正', hi_IN: '#ProtrudingMouthCorrection', tl_PH: '#ProtrudingMouthCorrection', ar_SA: normalizeArSa('تصحيح_بروز_الفم#') },
  { category: '안면윤곽', ko_KR: '#복합안면/V라인', en_US: '#ComplexFacial/VLine', th_TH: '#โครงหน้า/Vไลน์แบบผสม', zh_TW: '#複合臉型/V線', ja_JP: '#複合顔面/Vライン', hi_IN: '#ComplexFacial/VLine', tl_PH: '#ComplexFacial/VLine', ar_SA: normalizeArSa('ComplexFacial/VLine#') },
  { category: '안면윤곽', ko_KR: '#사각턱', en_US: '#SquareJaw', th_TH: '#กรามสี่เหลี่ยม', zh_TW: '#方下顎', ja_JP: '#エラ', hi_IN: '#SquareJaw', tl_PH: '#SquareJaw', ar_SA: normalizeArSa('الفك_المربع#') },
  { category: '안면윤곽', ko_KR: '#안면윤곽재수술', en_US: '#FacialContourRevision', th_TH: '#แก้ไขศัลยกรรมโครงหน้า', zh_TW: '#臉部輪廓修復手術', ja_JP: '#顔面輪郭再手術', hi_IN: '#FacialContourRevision', tl_PH: '#FacialContourRevision', ar_SA: normalizeArSa('إعادة_جراحة_نحت_الوجه#') },
  { category: '안면윤곽', ko_KR: '#양악', en_US: '#DoubleJawSurgery', th_TH: '#ผ่าตัดขากรรไกรสองข้าง', zh_TW: '#雙顎手術', ja_JP: '#両顎手術', hi_IN: '#DoubleJawSurgery', tl_PH: '#DoubleJawSurgery', ar_SA: normalizeArSa('DoubleJawSurgery#') },
  { category: '안면윤곽', ko_KR: '#이중턱', en_US: '#DoubleChin', th_TH: '#เหนียง', zh_TW: '#雙下巴', ja_JP: '#二重あご', hi_IN: '#डबलचिन', tl_PH: '#DoubleChin', ar_SA: normalizeArSa('الذقن_المزدوج#') },
  { category: '안면윤곽', ko_KR: '#턱끝', en_US: '#ChinTip', th_TH: '#ปลายคาง', zh_TW: '#下巴尖', ja_JP: '#顎先', hi_IN: '#ChinTip', tl_PH: '#ChinTip', ar_SA: normalizeArSa('طرف_الذقن#') },
  { category: '제모', ko_KR: '#다리제모', en_US: '#LegHairRemoval', th_TH: '#กำจัดขนขา', zh_TW: '#腿部除毛', ja_JP: '#脚脱毛', hi_IN: '#पैरोंकेबालहटाना', tl_PH: '#LegHairRemoval', ar_SA: normalizeArSa('إزالة_شعر_الساقين#') },
  { category: '줄기세포', ko_KR: '#줄기세포', en_US: '#StemCell', th_TH: '#สเต็มเซลล์', zh_TW: '#幹細胞', ja_JP: '#幹細胞', hi_IN: '#स्टेमसेल', tl_PH: '#StemCell', ar_SA: normalizeArSa('الخلايا_الجذعية#') },
  { category: '지방분해주사', ko_KR: '#등지방분해주사', en_US: '#BackFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันหลัง', zh_TW: '#背部溶脂注射', ja_JP: '#背中脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(पीठ)', tl_PH: '#BackFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_الظهر#') },
  { category: '지방분해주사', ko_KR: '#복부지방분해주사', en_US: '#AbdominalFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันหน้าท้อง', zh_TW: '#腹部溶脂注射', ja_JP: '#腹部脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(पेट)', tl_PH: '#AbdominalFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_البطن#') },
  { category: '지방분해주사', ko_KR: '#부유방지방분해주사', en_US: '#AccessoryBreastFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันรักแร้', zh_TW: '#副乳溶脂注射', ja_JP: '#副乳脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(副乳)', tl_PH: '#AccessoryBreastFatDissolvingInjection', ar_SA: normalizeArSa('AccessoryBreastFatDissolvingInjection#') },
  { category: '지방분해주사', ko_KR: '#얼굴지방분해주사', en_US: '#FaceFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันหน้า', zh_TW: '#臉部溶脂針', ja_JP: '#脂肪溶解注射', hi_IN: '#फेशियलफैटडिज़ॉल्विंगइंजेक्शन', tl_PH: '#FaceFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_الوجه#') },
  { category: '지방분해주사', ko_KR: '#옆구리지방분해주사', en_US: '#FlankFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันเอวข้าง', zh_TW: '#側腰溶脂注射', ja_JP: '#脇腹脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(साइड)', tl_PH: '#FlankFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_الخواصر#') },
  { category: '지방분해주사', ko_KR: '#지방분해주사', en_US: '#FatDissolvingInjection', th_TH: '#ฉีดสลายไขมัน', zh_TW: '#溶脂注射', ja_JP: '#脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन', tl_PH: '#FatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_الدهون#') },
  { category: '지방분해주사', ko_KR: '#팔지방분해주사', en_US: '#ArmFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันแขน', zh_TW: '#手臂溶脂注射', ja_JP: '#腕脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(बांह)', tl_PH: '#ArmFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_الذراعين#') },
  { category: '지방분해주사', ko_KR: '#허벅지지방분해주사', en_US: '#ThighFatDissolvingInjection', th_TH: '#ฉีดสลายไขมันต้นขา', zh_TW: '#大腿溶脂注射', ja_JP: '#太もも脂肪溶解注射', hi_IN: '#फैटडिसॉल्विंगइंजेक्शन(जांघ)', tl_PH: '#ThighFatDissolvingInjection', ar_SA: normalizeArSa('حقن_إذابة_دهون_الفخذين#') },
  { category: '지방이식', ko_KR: '#가슴지방이식', en_US: '#BreastFatGrafting', th_TH: '#เติมไขมันหน้าอก', zh_TW: '#乳房脂肪移植', ja_JP: '#胸脂肪注入', hi_IN: '#स्तनफैटग्राफ्टिंग', tl_PH: '#BreastFatGrafting', ar_SA: normalizeArSa('نقل_دهون_الثدي#') },
  { category: '지방이식', ko_KR: '#골반지방이식', en_US: '#PelvicFatGrafting', th_TH: '#เติมไขมันเชิงกราน', zh_TW: '#骨盆脂肪移植', ja_JP: '#骨盤脂肪注入', hi_IN: '#PelvicFatGrafting', tl_PH: '#PelvicFatGrafting', ar_SA: normalizeArSa('نقل_دهون_الحوض#') },
  { category: '지방이식', ko_KR: '#얼굴지방이식', en_US: '#FacialFatGrafting', th_TH: '#เติมไขมันหน้า', zh_TW: '#臉部脂肪移植', ja_JP: '#顔脂肪注入', hi_IN: '#फेशियलफैटग्राफ्टिंग', tl_PH: '#FacialFatGrafting', ar_SA: normalizeArSa('نقل_دهون_الوجه#') },
  { category: '지방이식', ko_KR: '#엉덩이지방이식', en_US: '#ButtockFatGrafting', th_TH: '#เติมไขมันสะโพก', zh_TW: '#臀部脂肪移植', ja_JP: '#臀部脂肪注入', hi_IN: '#नितंबफैटग्राफ्टिंग', tl_PH: '#ButtockFatGrafting', ar_SA: normalizeArSa('نقل_دهون_الأرداف#') },
  { category: '지방이식', ko_KR: '#팔자주름지방이식', en_US: '#NasolabialFatGrafting', th_TH: '#เติมไขมันร่องแก้ม', zh_TW: '#法令紋脂肪移植', ja_JP: '#ほうれい線脂肪注入', hi_IN: '#नैसोलेबियलफैटग्राफ्टिंग', tl_PH: '#NasolabialFatGrafting', ar_SA: normalizeArSa('NasolabialFatGrafting#') },
  { category: '지방흡입', ko_KR: '#등지방흡입', en_US: '#BackLiposuction', th_TH: '#ดูดไขมันหลัง', zh_TW: '#背部抽脂', ja_JP: '#背中脂肪吸引', hi_IN: '#पीठलाइपोसक्शन', tl_PH: '#BackLiposuction', ar_SA: normalizeArSa('شفط_دهون_الظهر#') },
  { category: '지방흡입', ko_KR: '#러브핸들지방흡입', en_US: '#LoveHandleLiposuction', th_TH: '#ดูดไขมันเอวข้าง', zh_TW: '#腰側抽脂', ja_JP: '#ラブハンドル脂肪吸引', hi_IN: '#LoveHandleLiposuction', tl_PH: '#LoveHandleLiposuction', ar_SA: normalizeArSa('شفط_دهون_الخواصر#') },
  { category: '지방흡입', ko_KR: '#무릎지방흡입', en_US: '#KneeLiposuction', th_TH: '#ดูดไขมันเข่า', zh_TW: '#膝部抽脂', ja_JP: '#膝脂肪吸引', hi_IN: '#घुटनालाइपोसक्शन', tl_PH: '#KneeLiposuction', ar_SA: normalizeArSa('شفط_دهون_الركبة#') },
  { category: '지방흡입', ko_KR: '#복부지방흡입', en_US: '#AbdominalLiposuction', th_TH: '#ดูดไขมันหน้าท้อง', zh_TW: '#腹部抽脂', ja_JP: '#腹部脂肪吸引', hi_IN: '#पेटलाइपोसक्शन', tl_PH: '#AbdominalLiposuction', ar_SA: normalizeArSa('شفط_دهون_البطن#') },
  { category: '지방흡입', ko_KR: '#부유방제거수술', en_US: '#AccessoryBreastRemovalSurgery', th_TH: '#ผ่าตัดเอาเต้านมเสริมออก', zh_TW: '#副乳切除手術', ja_JP: '#副乳除去手術', hi_IN: '#AccessoryBreastRemovalSurgery', tl_PH: '#AccessoryBreastRemovalSurgery', ar_SA: normalizeArSa('AccessoryBreastRemovalSurgery#') },
  { category: '지방흡입', ko_KR: '#부유방지방흡입', en_US: '#AccessoryBreastLiposuction', th_TH: '#ดูดไขมันรักแร้', zh_TW: '#副乳抽脂', ja_JP: '#副乳脂肪吸引', hi_IN: '#AccessoryBreastLiposuction', tl_PH: '#AccessoryBreastLiposuction', ar_SA: normalizeArSa('AccessoryBreastLiposuction#') },
  { category: '지방흡입', ko_KR: '#얼굴지방흡입', en_US: '#FacialLiposuction', th_TH: '#ดูดไขมันหน้า', zh_TW: '#臉部抽脂', ja_JP: '#顔脂肪吸引', hi_IN: '#फेशियललाइपोसक्शन', tl_PH: '#FacialLiposuction', ar_SA: normalizeArSa('شفط_دهون_الوجه#') },
  { category: '지방흡입', ko_KR: '#옆구리지방흡입', en_US: '#FlankLiposuction', th_TH: '#ดูดไขมันเอวข้าง', zh_TW: '#側腰抽脂', ja_JP: '#脇腹脂肪吸引', hi_IN: '#FlankLiposuction', tl_PH: '#FlankLiposuction', ar_SA: normalizeArSa('شفط_دهون_الخواصر#') },
  { category: '지방흡입', ko_KR: '#이중턱근육묶기', en_US: '#DoubleChinMuscleTightening', th_TH: '#รัดกล้ามเนื้อคางสองชั้น', zh_TW: '#雙下巴肌肉束緊', ja_JP: '#二重あご筋肉結紮', hi_IN: '#DoubleChinMuscleTightening', tl_PH: '#DoubleChinMuscleTightening', ar_SA: normalizeArSa('DoubleChinMuscleTightening#') },
  { category: '지방흡입', ko_KR: '#이중턱지방흡입', en_US: '#DoubleChinLiposuction', th_TH: '#ดูดไขมันเหนียง', zh_TW: '#雙下巴抽脂', ja_JP: '#二重あご脂肪吸引', hi_IN: '#डबलचिनलाइपोसक्शन', tl_PH: '#DoubleChinLiposuction', ar_SA: normalizeArSa('شفط_دهون_الذقن_المزدوج#') },
  { category: '지방흡입', ko_KR: '#전신지방흡입', en_US: '#FullBodyLiposuction', th_TH: '#ดูดไขมันทั้งตัว', zh_TW: '#全身抽脂', ja_JP: '#全身脂肪吸引', hi_IN: '#फुलबॉडीलाइपोसक्शन', tl_PH: '#FullBodyLiposuction', ar_SA: normalizeArSa('شفط_دهون_كامل_الجسم#') },
  { category: '지방흡입', ko_KR: '#종아리지방흡입', en_US: '#CalfLiposuction', th_TH: '#ดูดไขมันน่อง', zh_TW: '#小腿抽脂', ja_JP: '#ふくらはぎ脂肪吸引', hi_IN: '#पिंडलीलाइपोसक्शन', tl_PH: '#CalfLiposuction', ar_SA: normalizeArSa('شفط_دهون_الربلة#') },
  { category: '지방흡입', ko_KR: '#지방흡입재수술', en_US: '#LiposuctionRevision', th_TH: '#แก้ไขดูดไขมัน', zh_TW: '#抽脂修復手術', ja_JP: '#脂肪吸引再手術', hi_IN: '#LiposuctionRevision', tl_PH: '#LiposuctionRevision', ar_SA: normalizeArSa('إعادة_شفط_الدهون#') },
  { category: '지방흡입', ko_KR: '#팔지방흡입', en_US: '#ArmLiposuction', th_TH: '#ดูดไขมันแขน', zh_TW: '#手臂抽脂', ja_JP: '#腕脂肪吸引', hi_IN: '#बांहलाइपोसक्शन', tl_PH: '#ArmLiposuction', ar_SA: normalizeArSa('شفط_دهون_الذراعين#') },
  { category: '지방흡입', ko_KR: '#허벅지지방흡입', en_US: '#ThighLiposuction', th_TH: '#ดูดไขมันต้นขา', zh_TW: '#大腿抽脂', ja_JP: '#太もも脂肪吸引', hi_IN: '#जांघलाइपोसक्शन', tl_PH: '#ThighLiposuction', ar_SA: normalizeArSa('شفط_دهون_الفخذين#') },
  { category: '치과', ko_KR: '#라미네이트', en_US: '#Dental Veneer', th_TH: '#วีเนียร์ฟัน', zh_TW: '#陶瓷貼片', ja_JP: '#ラミネートベニア', hi_IN: '#डेंटल वेनियर', tl_PH: '#Dental Veneer', ar_SA: normalizeArSa('قشور_الأسنان#') },
  { category: '치과', ko_KR: '#미니쉬', en_US: '#Minish', th_TH: '#มินิช', zh_TW: '#Minish', ja_JP: '#ミニッシュ', hi_IN: '#Minish', tl_PH: '#Minish', ar_SA: normalizeArSa('Minish#') },
  { category: '치과', ko_KR: '#베니어시술', en_US: '#DentalVeneers', th_TH: '#วีเนียร์ฟัน', zh_TW: '#牙齒貼片', ja_JP: '#ラミネートベニア', hi_IN: '#डेंटलवेनीयर', tl_PH: '#DentalVeneers', ar_SA: normalizeArSa('DentalVeneers#') },
  { category: '치과', ko_KR: '#스케일링', en_US: '#DentalScaling', th_TH: '#ขูดหินปูน', zh_TW: '#洗牙', ja_JP: '#スケーリング', hi_IN: '#डेंटलस्केलिंग', tl_PH: '#DentalScaling', ar_SA: normalizeArSa('DentalScaling#') },
  { category: '치과', ko_KR: '#잇몸케어', en_US: '#GumCare', th_TH: '#ดูแลเหงือก', zh_TW: '#牙齦護理', ja_JP: '#歯ぐきケア', hi_IN: '#मसूड़ोंकीदेखभाल', tl_PH: '#GumCare', ar_SA: normalizeArSa('العناية_باللثة#') },
  { category: '치과', ko_KR: '#치과', en_US: '#DentalClinic', th_TH: '#คลินิกทันตกรรม', zh_TW: '#牙科', ja_JP: '#歯科', hi_IN: '#दंतचिकित्सा', tl_PH: '#DentalClinic', ar_SA: normalizeArSa('طب_الأسنان#') },
  { category: '치과', ko_KR: '#치아교정', en_US: '#Orthodontic Treatment', th_TH: '#การจัดฟัน', zh_TW: '#牙齒矯正', ja_JP: '#歯列矯正', hi_IN: '#दाँतों का सुधार', tl_PH: '#Orthodontic Treatment', ar_SA: normalizeArSa('تقويم_الأسنان#') },
  { category: '치과', ko_KR: '#치아미백', en_US: '#Teeth Whitening', th_TH: '#ฟอกสีฟัน', zh_TW: '#牙齒美白', ja_JP: '#ホワイトニング', hi_IN: '#दांतोंकीसफेदी', tl_PH: '#Teeth Whitening', ar_SA: normalizeArSa('تبييض_الأسنان#') },
  { category: '치과', ko_KR: '#치아치료', en_US: '#Dental Treatment', th_TH: '#การรักษาทางทันตกรรม', zh_TW: '#牙齒治療', ja_JP: '#歯科治療', hi_IN: '#दंतउपचार', tl_PH: '#Dental Treatment', ar_SA: normalizeArSa('علاج_الأسنان#') },
  { category: '코', ko_KR: '#복코교정(수술)', en_US: '#BulbousNoseCorrection(Surgery)', th_TH: '#แก้ไขจมูกชมพู่(ผ่าตัด)', zh_TW: '#蒜頭鼻矯正(手術)', ja_JP: '#団子鼻修正(手術)', hi_IN: '#BulbousNoseCorrection(Surgery)', tl_PH: '#BulbousNoseCorrection(Surgery)', ar_SA: normalizeArSa('تصحيح_الأنف_العريض_(جراحة)#') },
  { category: '코', ko_KR: '#비염수술', en_US: '#RhinitisSurgery', th_TH: '#ผ่าตัดรักษาโรคจมูกอักเสบ', zh_TW: '#鼻炎手術', ja_JP: '#鼻炎手術', hi_IN: '#RhinitisSurgery', tl_PH: '#RhinitisSurgery', ar_SA: normalizeArSa('جراحة_التهاب_الأنف#') },
  { category: '코', ko_KR: '#비중격만곡증수술', en_US: '#SeptalDeviationSurgery', th_TH: '#ผ่าตัดผนังกั้นจมูกคด', zh_TW: '#鼻中隔彎曲矯正手術', ja_JP: '#鼻中隔弯曲症手術', hi_IN: '#SeptalDeviationSurgery', tl_PH: '#SeptalDeviationSurgery', ar_SA: normalizeArSa('جراحة_انحراف_الحاجز_الأنفي#') },
  { category: '코', ko_KR: '#코길이연장', en_US: '#NasalLengthening', th_TH: '#ยืดความยาวจมูก', zh_TW: '#鼻部延長', ja_JP: '#鼻延長', hi_IN: '#NasalLengthening', tl_PH: '#NasalLengthening', ar_SA: normalizeArSa('إطالة_الأنف#') },
  { category: '코', ko_KR: '#코끝(기증연골)', en_US: '#NasalTip(DonorCartilage)', th_TH: '#ปลายจมูก(กระดูกอ่อนผู้บริจาค)', zh_TW: '#鼻尖(供體軟骨)', ja_JP: '#鼻先(ドナー軟骨)', hi_IN: '#NasalTip(DonorCartilage)', tl_PH: '#NasalTip(DonorCartilage)', ar_SA: normalizeArSa('NasalTip(DonorCartilage)#') },
  { category: '코', ko_KR: '#코끝(보형물)', en_US: '#NasalTip(Implant)', th_TH: '#ปลายจมูก(ซิลิโคน)', zh_TW: '#鼻尖(假體)', ja_JP: '#鼻先(プロテーゼ)', hi_IN: '#NasalTip(Implant)', tl_PH: '#NasalTip(Implant)', ar_SA: normalizeArSa('طرف_الأنف_(زرع)#') },
  { category: '코', ko_KR: '#코끝(자가조직)', en_US: '#NasalTip(AutologousTissue)', th_TH: '#ปลายจมูก(เนื้อเยื่อตนเอง)', zh_TW: '#鼻尖(自體組織)', ja_JP: '#鼻先(自家組織)', hi_IN: '#NasalTip(AutologousTissue)', tl_PH: '#NasalTip(AutologousTissue)', ar_SA: normalizeArSa('طرف_الأنف_(أنسجة_ذاتية)#') },
  { category: '코', ko_KR: '#코재수술', en_US: '#RevisionRhinoplasty', th_TH: '#ผ่าตัดแก้จมูก', zh_TW: '#鼻修復手術', ja_JP: '#鼻再手術', hi_IN: '#RevisionRhinoplasty', tl_PH: '#RevisionRhinoplasty', ar_SA: normalizeArSa('إعادة_جراحة_الأنف#') },
  { category: '코', ko_KR: '#코절골술', en_US: '#NasalOsteotomy', th_TH: '#การตัดกระดูกจมูก', zh_TW: '#鼻骨截骨術', ja_JP: '#鼻骨骨切り術', hi_IN: '#नासिकाअस्थिऑस्टियोटॉमी', tl_PH: '#NasalOsteotomy', ar_SA: normalizeArSa('NasalOsteotomy#') },
  { category: '코', ko_KR: '#콧대(보형물)', en_US: '#NasalBridge(Implant)', th_TH: '#สันจมูก(ซิลิโคน)', zh_TW: '#鼻樑(假體)', ja_JP: '#鼻筋(プロテーゼ)', hi_IN: '#NasalBridge(Implant)', tl_PH: '#NasalBridge(Implant)', ar_SA: normalizeArSa('جسر_الأنف_(زرع)#') },
  { category: '코', ko_KR: '#콧대(자가조직)', en_US: '#NasalBridge(AutologousTissue)', th_TH: '#สันจมูก(เนื้อเยื่อตนเอง)', zh_TW: '#鼻樑(自體組織)', ja_JP: '#鼻筋(自家組織)', hi_IN: '#NasalBridge(AutologousTissue)', tl_PH: '#NasalBridge(AutologousTissue)', ar_SA: normalizeArSa('جسر_الأنف_(أنسجة_ذاتية)#') },
  { category: '코', ko_KR: '#콧볼(내측절개)', en_US: '#Alar(InternalIncision)', th_TH: '#ปีกจมูก(แผลด้านใน)', zh_TW: '#鼻翼(內側切開)', ja_JP: '#小鼻(内側切開)', hi_IN: '#Alar(InternalIncision)', tl_PH: '#Alar(InternalIncision)', ar_SA: normalizeArSa('تصغير_فتحتي_الأنف_(شق_داخلي)#') },
  { category: '코', ko_KR: '#콧볼(비절개)', en_US: '#Alar(NonIncisional)', th_TH: '#ปีกจมูก(ไม่ผ่าตัด)', zh_TW: '#鼻翼(非切開)', ja_JP: '#小鼻(非切開)', hi_IN: '#Alar(NonIncisional)', tl_PH: '#Alar(NonIncisional)', ar_SA: normalizeArSa('تصغير_فتحتي_الأنف_(بدون_شق)#') },
  { category: '코', ko_KR: '#콧볼축소', en_US: '#AlarReduction', th_TH: '#ตัดปีกจมูก', zh_TW: '#鼻翼縮小', ja_JP: '#小鼻縮小', hi_IN: '#AlarReduction', tl_PH: '#AlarReduction', ar_SA: normalizeArSa('تصغير_فتحتي_الأنف#') },
  { category: '피부', ko_KR: '#리쥬란힐러', en_US: '#RejuranHealer', th_TH: '#RejuranHealer', zh_TW: '#麗珠蘭', ja_JP: '#リジュランヒーラー', hi_IN: '#RejuranHealer', tl_PH: '#RejuranHealer', ar_SA: normalizeArSa('RejuranHealer#') },
  { category: '피부', ko_KR: '#모공케어', en_US: '#PoreCare', th_TH: '#ดูแลรูขุมขน', zh_TW: '#毛孔護理', ja_JP: '#毛穴ケア', hi_IN: '#PoreCare', tl_PH: '#PoreCare', ar_SA: normalizeArSa('العناية_بالمسام#') },
  { category: '피부', ko_KR: '#새살침', en_US: '#SkinRegenerationNeedling', th_TH: '#เข็มกระตุ้นผิวใหม่', zh_TW: '#新生肌注射', ja_JP: '#再生針', hi_IN: '#SkinRegenerationNeedling', tl_PH: '#SkinRegenerationNeedling', ar_SA: normalizeArSa('SkinRegenerationNeedling#') },
  { category: '피부', ko_KR: '#색소침착', en_US: '#Hyperpigmentation', th_TH: '#เม็ดสีผิว', zh_TW: '#色素沉著', ja_JP: '#色素沈着', hi_IN: '#हाइपरपिग्मेंटेशन', tl_PH: '#Hyperpigmentation', ar_SA: normalizeArSa('تصبغات_الجلد#') },
  { category: '피부', ko_KR: '#소프웨이브', en_US: '#Sofwave', th_TH: '#ซอฟเวฟ', zh_TW: '#Sofwave', ja_JP: '#ソフウェーブ', hi_IN: '#Sofwave', tl_PH: '#Sofwave', ar_SA: normalizeArSa('Sofwave#') },
  { category: '피부', ko_KR: '#스킨보톡스', en_US: '#SkinBotox', th_TH: '#สกินโบท็อกซ์', zh_TW: '#皮膚肉毒', ja_JP: '#スキンボトックス', hi_IN: '#स्किनबोटॉक्स', tl_PH: '#SkinBotox', ar_SA: normalizeArSa('SkinBotox#') },
  { category: '피부', ko_KR: '#스킨부스터', en_US: '#SkinBooster', th_TH: '#สกินบูสเตอร์', zh_TW: '#皮膚增強劑', ja_JP: '#スキンブースター', hi_IN: '#स्किनबूस्टर', tl_PH: '#SkinBooster', ar_SA: normalizeArSa('SkinBooster#') },
  { category: '피부', ko_KR: '#스킨케어', en_US: '#Skincare', th_TH: '#การดูแลผิว', zh_TW: '#皮膚保養', ja_JP: '#スキンケア', hi_IN: '#Skincare', tl_PH: '#Skincare', ar_SA: normalizeArSa('العناية_بالبشرة#') },
  { category: '피부', ko_KR: '#아그네스레이저', en_US: '#AgnesLaser', th_TH: '#เลเซอร์แอ็กเนส', zh_TW: '#Agnes雷射', ja_JP: '#アグネスレーザー', hi_IN: '#AgnesLaser', tl_PH: '#AgnesLaser', ar_SA: normalizeArSa('AgnesLaser#') },
  { category: '피부', ko_KR: '#여드름치료', en_US: '#AcneTreatment', th_TH: '#รักษาสิว', zh_TW: '#痘痘治療', ja_JP: '#ニキビ治療', hi_IN: '#मुंहासाउपचार', tl_PH: '#AcneTreatment', ar_SA: normalizeArSa('علاج_حب_الشباب#') },
  { category: '피부', ko_KR: '#포텐자', en_US: '#Potenza', th_TH: '#โพเทนซา', zh_TW: '#Potenza', ja_JP: '#ポテンツァ', hi_IN: '#Potenza', tl_PH: '#Potenza', ar_SA: normalizeArSa('Potenza#') },
  { category: '피부', ko_KR: '#피부고민', en_US: '#SkinConcerns', th_TH: '#ปัญหาผิว', zh_TW: '#皮膚問題', ja_JP: '#肌悩み', hi_IN: '#SkinConcerns', tl_PH: '#SkinConcerns', ar_SA: normalizeArSa('مشاكل_البشرة#') },
  { category: '피부', ko_KR: '#피코토닝', en_US: '#PicoToning', th_TH: '#พิโคโทนนิ่ง', zh_TW: '#皮秒淨膚', ja_JP: '#ピコトーニング', hi_IN: '#PicoToning', tl_PH: '#PicoToning', ar_SA: normalizeArSa('PicoToning#') },
  { category: '피부', ko_KR: '#피코프락셀', en_US: '#PicoFraxel', th_TH: '#พิโคแฟรคเซล', zh_TW: '#皮秒飛梭', ja_JP: '#ピコフラクショナル', hi_IN: '#PicoFraxel', tl_PH: '#PicoFraxel', ar_SA: normalizeArSa('PicoFraxel#') },
  { category: '피부', ko_KR: '#흉터제거레이저', en_US: '#ScarRemovalLaser', th_TH: '#เลเซอร์ลบรอยแผลเป็น', zh_TW: '#疤痕去除雷射', ja_JP: '#瘢痕除去レーザー', hi_IN: '#ScarRemovalLaser', tl_PH: '#ScarRemovalLaser', ar_SA: normalizeArSa('ليزر_إزالة_الندبات#') },
  { category: '피부', ko_KR: '#흉터제거주사', en_US: '#ScarRemovalInjection', th_TH: '#ฉีดลบรอยแผลเป็น', zh_TW: '#疤痕去除注射', ja_JP: '#瘢痕除去注射', hi_IN: '#ScarRemovalInjection', tl_PH: '#ScarRemovalInjection', ar_SA: normalizeArSa('حقن_إزالة_الندبات#') },
  { category: '피부', ko_KR: '#LDM', en_US: '#LDM', th_TH: '#LDM', zh_TW: '#LDM', ja_JP: '#LDM', hi_IN: '#LDM', tl_PH: '#LDM', ar_SA: normalizeArSa('LDM#') },
  { category: '필러', ko_KR: '#가슴필러', en_US: '#BreastFiller', th_TH: '#ฟิลเลอร์หน้าอก', zh_TW: '#乳房填充', ja_JP: '#バストフィラー', hi_IN: '#स्तनफिलर', tl_PH: '#BreastFiller', ar_SA: normalizeArSa('BreastFiller#') },
  { category: '필러', ko_KR: '#골반필러', en_US: '#PelvicFiller', th_TH: '#ฟิลเลอร์สะโพก', zh_TW: '#骨盆填充', ja_JP: '#骨盤フィラー', hi_IN: '#PelvicFiller', tl_PH: '#PelvicFiller', ar_SA: normalizeArSa('PelvicFiller#') },
  { category: '필러', ko_KR: '#다리필러', en_US: '#LegFiller', th_TH: '#ฟิลเลอร์ขา', zh_TW: '#腿部填充', ja_JP: '#脚フィラー', hi_IN: '#LegFiller', tl_PH: '#LegFiller', ar_SA: normalizeArSa('LegFiller#') },
  { category: '필러', ko_KR: '#손등필러', en_US: '#HandFiller', th_TH: '#ฟิลเลอร์หลังมือ', zh_TW: '#手背填充', ja_JP: '#手の甲フィラー', hi_IN: '#हाथकीपीठफिलर', tl_PH: '#HandFiller', ar_SA: normalizeArSa('HandFiller#') },
  { category: '필러', ko_KR: '#어깨필러', en_US: '#ShoulderFiller', th_TH: '#ฟิลเลอร์ไหล่', zh_TW: '#肩部填充', ja_JP: '#肩フィラー', hi_IN: '#कंधाफिलर', tl_PH: '#ShoulderFiller', ar_SA: normalizeArSa('ShoulderFiller#') },
  { category: '필러', ko_KR: '#얼굴필러', en_US: '#FacialFiller', th_TH: '#ฟิลเลอร์หน้า', zh_TW: '#臉部填充', ja_JP: '#顔フィラー', hi_IN: '#फेशियलफिलर', tl_PH: '#FacialFiller', ar_SA: normalizeArSa('FacialFiller#') },
  { category: '필러', ko_KR: '#엉덩이필러', en_US: '#ButtFiller', th_TH: '#ฟิลเลอร์ก้น', zh_TW: '#臀部填充', ja_JP: '#ヒップフィラー', hi_IN: '#ButtFiller', tl_PH: '#ButtFiller', ar_SA: normalizeArSa('ButtFiller#') },
  { category: '필러', ko_KR: '#입술필러', en_US: '#LipFiller', th_TH: '#ฟิลเลอร์ริมฝีปาก', zh_TW: '#唇部填充', ja_JP: '#唇フィラー', hi_IN: '#लिपफिलर', tl_PH: '#LipFiller', ar_SA: normalizeArSa('LipFiller#') },
];

/** 한국어 고민부위 해시태그 → ar_SA 매핑 맵 */
export const CONCERN_KO_TO_AR_SA = new Map<string, string>();
CONCERN_MAPPINGS_WITH_AR.forEach((m) => {
  CONCERN_KO_TO_AR_SA.set(m.ko_KR, m.ar_SA);
});

/**
 * 한국어 고민부위 태그로 ar_SA 값 조회
 */
export function findArSaByKoTag(koTag: string): string | undefined {
  return CONCERN_KO_TO_AR_SA.get(koTag);
}
