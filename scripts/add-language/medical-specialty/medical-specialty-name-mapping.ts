/**
 * 시술부위(MedicalSpecialty) name 다국어 매핑표
 * 한국어 name(ko_KR)을 키로 각 로케일별 표시명 매핑 (러시아어 포함)
 */

export type MedicalSpecialtyLocale =
  | 'ko_KR'
  | 'en_US'
  | 'th_TH'
  | 'zh_TW'
  | 'ja_JP'
  | 'hi_IN'
  | 'tl_PH'
  | 'ar_SA'
  | 'ru_RU';

export interface MedicalSpecialtyNameMappingRow {
  ko_KR: string;
  en_US: string;
  th_TH: string;
  zh_TW: string;
  ja_JP: string;
  hi_IN: string;
  tl_PH: string;
  ar_SA: string;
  ru_RU: string;
}

/**
 * 시술부위 name 매핑 (한국어 → 각 로케일)
 * 컬럼: 한국어, 영어, 태국어, 중국어(번체), 일본어, 힌디어, 필리핀어(영어), 아랍어, 러시아어
 */
export const MEDICAL_SPECIALTY_NAME_MAPPING: MedicalSpecialtyNameMappingRow[] = [
  { ko_KR: '눈', en_US: 'Eyes', th_TH: 'ดวงตา', zh_TW: '眼睛', ja_JP: '目', hi_IN: 'आंखें', tl_PH: 'Eyes', ar_SA: 'عيون', ru_RU: 'глаз' },
  { ko_KR: '코', en_US: 'Nose', th_TH: 'จมูก', zh_TW: '鼻子', ja_JP: '鼻', hi_IN: 'नाक', tl_PH: 'Nose', ar_SA: 'أنف', ru_RU: 'нос' },
  { ko_KR: '리프팅', en_US: 'Lifting', th_TH: 'ยกกระชับ', zh_TW: '拉提', ja_JP: 'リフティング', hi_IN: 'लिफ्टिंग', tl_PH: 'Lifting', ar_SA: 'رفع', ru_RU: 'Подъем' },
  { ko_KR: '안면윤곽', en_US: 'Facial Contouring', th_TH: 'แก้ไขโครงหน้า', zh_TW: '臉部輪廓', ja_JP: '顔面輪郭', hi_IN: 'चेहरे की आकृति', tl_PH: 'Facial Contouring', ar_SA: 'تشكيل الوجه', ru_RU: 'контурирование лица' },
  { ko_KR: '가슴', en_US: 'Breast', th_TH: 'หน้าอก', zh_TW: '胸部', ja_JP: '胸', hi_IN: 'स्तन', tl_PH: 'Breast', ar_SA: 'الثدي', ru_RU: 'грудь' },
  { ko_KR: '줄기세포', en_US: 'Stem Cell', th_TH: 'เซลล์ต้นกำเนิด', zh_TW: '幹細胞', ja_JP: '幹細胞', hi_IN: 'स्टेम सेल', tl_PH: 'Stem Cell', ar_SA: 'الخلايا الجذعية', ru_RU: 'стволовые клетки' },
  { ko_KR: '지방흡입', en_US: 'Liposuction', th_TH: 'ศัลยกรรมดูดไขมัน', zh_TW: '抽脂', ja_JP: '脂肪吸引', hi_IN: 'लिपोसक्शन', tl_PH: 'Liposuction', ar_SA: 'شفط الدهون', ru_RU: 'Липосакция' },
  { ko_KR: '바디', en_US: 'Body', th_TH: 'ศัลยกรรมร่างกาย', zh_TW: '身體', ja_JP: 'ボディ', hi_IN: 'बॉडी', tl_PH: 'Body', ar_SA: 'الجسم', ru_RU: 'тело' },
  { ko_KR: '모발이식', en_US: 'Hair Transplant', th_TH: 'ปลูกผม', zh_TW: '植髮', ja_JP: '植毛', hi_IN: 'बाल प्रत्यारोपण', tl_PH: 'Hair Transplant', ar_SA: 'زراعة الشعر', ru_RU: 'пересадка волос' },
  { ko_KR: '피부과', en_US: 'Dermatology', th_TH: 'โรคผิวหนัง', zh_TW: '皮膚科', ja_JP: '皮膚科', hi_IN: 'त्वचा विज्ञान', tl_PH: 'Dermatology', ar_SA: 'الجلدية', ru_RU: 'дерматология' },
  { ko_KR: '치과', en_US: 'Dental', th_TH: 'ทันตกรรม', zh_TW: '牙科', ja_JP: '歯科', hi_IN: 'दंत चिकित्सा', tl_PH: 'Dental', ar_SA: 'الأسنان', ru_RU: 'Стоматология' },
  { ko_KR: '기타', en_US: 'Others', th_TH: 'อื่นๆ', zh_TW: '其他', ja_JP: 'その他', hi_IN: 'अन्य', tl_PH: 'Others', ar_SA: 'أخرى', ru_RU: 'и т. д.' },
];

/** 한국어 name → ru_RU 매핑 맵 (스크립트에서 사용) */
export const MEDICAL_SPECIALTY_KO_TO_RU_RU = new Map<string, string>();
MEDICAL_SPECIALTY_NAME_MAPPING.forEach((row) => {
  MEDICAL_SPECIALTY_KO_TO_RU_RU.set(row.ko_KR, row.ru_RU);
});

export function getRuRuByNameKo(koName: string): string | undefined {
  return MEDICAL_SPECIALTY_KO_TO_RU_RU.get(koName);
}
