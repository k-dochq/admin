/**
 * District 매핑 정보
 *
 * District 데이터의 name과 displayName 필드에 사용되는 지역명의 다국어 매핑 정보
 */

import type { Locale } from './types';

// 대분류 타입
export type MajorCategory = '서울' | '경기' | '부산' | '인천' | '제주';

// 대분류 매핑 정보
export const MAJOR_CATEGORY_MAPPING: Record<MajorCategory, Record<Locale, string>> = {
  서울: {
    ko_KR: '서울',
    en_US: 'Seoul',
    th_TH: 'โซล',
    zh_TW: '首爾',
    ja_JP: 'ソウル',
    hi_IN: 'Seoul',
    tl_PH: 'Seoul',
    ar_SA: 'Seoul',
    ru_RU: 'Сеул',
  },
  경기: {
    ko_KR: '경기',
    en_US: 'Gyeonggi',
    th_TH: 'คยองกี',
    zh_TW: '京畿道',
    ja_JP: '京畿道',
    hi_IN: 'Gyeonggi',
    tl_PH: 'Gyeonggi',
    ar_SA: 'Gyeonggi',
    ru_RU: 'Кёнгидо',
  },
  부산: {
    ko_KR: '부산',
    en_US: 'Busan',
    th_TH: 'ปูซาน',
    zh_TW: '釜山',
    ja_JP: '釜山',
    hi_IN: 'Busan',
    tl_PH: 'Busan',
    ar_SA: 'Busan',
    ru_RU: 'Пусан',
  },
  인천: {
    ko_KR: '인천',
    en_US: 'Incheon',
    th_TH: 'อินชอน',
    zh_TW: '仁川',
    ja_JP: '仁川',
    hi_IN: 'Incheon',
    tl_PH: 'Incheon',
    ar_SA: 'Incheon',
    ru_RU: 'Инчхон',
  },
  제주: {
    ko_KR: '제주',
    en_US: 'Jeju',
    th_TH: 'เชจู',
    zh_TW: '濟州',
    ja_JP: '済州',
    hi_IN: 'Jeju',
    tl_PH: 'Jeju',
    ar_SA: 'Jeju',
    ru_RU: 'Чеджу',
  },
};

// District 매핑 정보 (대분류별 하위 지역)
export const DISTRICT_MAPPING: Record<MajorCategory, Record<string, Record<Locale, string>>> = {
  서울: {
    '청담/압구정': {
      ko_KR: '청담/압구정',
      en_US: 'Cheongdam/Apgujeong',
      th_TH: 'ชองดัม/อับกูจอง',
      zh_TW: '淸潭/狎鷗亭',
      ja_JP: '淸潭/狎鴎亭',
      hi_IN: 'Cheongdam/Apgujeong',
      tl_PH: 'Cheongdam/Apgujeong',
      ar_SA: 'Cheongdam/Apgujeong',
      ru_RU: 'Чхондэм/Апгуджон',
    },
    '강남역/신논현/양재': {
      ko_KR: '강남역/신논현/양재',
      en_US: 'Gangnam Station/Sinnonhyeon/Yangjae',
      th_TH: 'สถานีกังนัม/ชินนอนฮยอน/ยังแจ',
      zh_TW: '江南站/新論峴/良才',
      ja_JP: '江南駅/新論峴/良才',
      hi_IN: 'Gangnam Station/Sinnonhyeon/Yangjae',
      tl_PH: 'Gangnam Station/Sinnonhyeon/Yangjae',
      ar_SA: 'Gangnam Station/Sinnonhyeon/Yangjae',
      ru_RU: 'Каннамёк/Синнонхён/Янчжэ',
    },
    '문정/장지': {
      ko_KR: '문정/장지',
      en_US: 'Munjeong/Jangji',
      th_TH: 'มูนจอง/จางจี',
      zh_TW: '文井/長旨',
      ja_JP: '文井/長旨',
      hi_IN: 'Munjeong/Jangji',
      tl_PH: 'Munjeong/Jangji',
      ar_SA: 'Munjeong/Jangji',
      ru_RU: 'Munjeong/Jangji',
    },
    서초: {
      ko_KR: '서초',
      en_US: 'Seocho',
      th_TH: 'ซอโช',
      zh_TW: '瑞草',
      ja_JP: '瑞草',
      hi_IN: 'Seocho',
      tl_PH: 'Seocho',
      ar_SA: 'Seocho',
      ru_RU: 'Сочхо',
    },
    '선릉/역삼/삼성': {
      ko_KR: '선릉/역삼/삼성',
      en_US: 'Seolleung/Yeoksam/Samsung',
      th_TH: 'ซอลลึง/ยอกซัม/ซัมซุง',
      zh_TW: '宣陵/驛三/三成',
      ja_JP: '宣陵/駅三/三成',
      hi_IN: 'Seolleung/Yeoksam/Samsung',
      tl_PH: 'Seolleung/Yeoksam/Samsung',
      ar_SA: 'Seolleung/Yeoksam/Samsung',
      ru_RU: 'Seolleung/Ёксам/Samsung',
    },
    '신사/논현/반포': {
      ko_KR: '신사/논현/반포',
      en_US: 'Sinsa/Nonhyeon/Banpo',
      th_TH: 'ชินซา/นอนฮยอน/บันโพ',
      zh_TW: '新沙/論峴/盤浦',
      ja_JP: '新沙/論峴/盤浦',
      hi_IN: 'Sinsa/Nonhyeon/Banpo',
      tl_PH: 'Sinsa/Nonhyeon/Banpo',
      ar_SA: 'Sinsa/Nonhyeon/Banpo',
      ru_RU: 'Sinsa/Нонхён/Банпо',
    },
    '여의도/영등포': {
      ko_KR: '여의도/영등포',
      en_US: 'Yeouido/Yeongdeungpo',
      th_TH: 'ยออีโด/ยองดึงโพ',
      zh_TW: '汝矣島/永登浦',
      ja_JP: '汝矣島/永登浦',
      hi_IN: 'Yeouido/Yeongdeungpo',
      tl_PH: 'Yeouido/Yeongdeungpo',
      ar_SA: 'Yeouido/Yeongdeungpo',
      ru_RU: 'Ёыйдо/Ёндынпхо',
    },
  },
  경기: {
    '안양/과천': {
      ko_KR: '안양/과천',
      en_US: 'Anyang/Gwacheon',
      th_TH: 'อันยาง/กวาชอน',
      zh_TW: '安養/果川',
      ja_JP: '安養/果川',
      hi_IN: 'Anyang/Gwacheon',
      tl_PH: 'Anyang/Gwacheon',
      ar_SA: 'Anyang/Gwacheon',
      ru_RU: 'Анян/Квачхон',
    },
    '일산/고양': {
      ko_KR: '일산/고양',
      en_US: 'Ilsan/Goyang',
      th_TH: 'อิลซาน/โกยาง',
      zh_TW: '一山/高陽',
      ja_JP: '一山/高陽',
      hi_IN: 'Ilsan/Goyang',
      tl_PH: 'Ilsan/Goyang',
      ar_SA: 'Ilsan/Goyang',
      ru_RU: 'Ильсан/Коян',
    },
    '판교/분당': {
      ko_KR: '판교/분당',
      en_US: 'Pangyo/Bundang',
      th_TH: 'พังโย/บุนดัง',
      zh_TW: '板橋/盆唐',
      ja_JP: '板橋/盆唐',
      hi_IN: 'Pangyo/Bundang',
      tl_PH: 'Pangyo/Bundang',
      ar_SA: 'Pangyo/Bundang',
      ru_RU: 'Пангё/Пундан',
    },
    '수원/광교': {
      ko_KR: '수원/광교',
      en_US: 'Suwon/Gwanggyo',
      th_TH: 'ซูวอน/กวางกโย',
      zh_TW: '水原/光敎',
      ja_JP: '水原/光教',
      hi_IN: 'Suwon/Gwanggyo',
      tl_PH: 'Suwon/Gwanggyo',
      ar_SA: 'Suwon/Gwanggyo',
      ru_RU: 'Сувон/Квангё',
    },
    '용인/수지': {
      ko_KR: '용인/수지',
      en_US: 'Yongin/Suji',
      th_TH: 'ยงอิน/ซูจี',
      zh_TW: '龍仁/水枝',
      ja_JP: '龍仁/水枝',
      hi_IN: 'Yongin/Suji',
      tl_PH: 'Yongin/Suji',
      ar_SA: 'Yongin/Suji',
      ru_RU: 'Ёнин/Suji',
    },
  },
  부산: {
    '부산진구/서면': {
      ko_KR: '부산진구/서면',
      en_US: 'Busanjin-gu/Seomyeon',
      th_TH: 'ปูซานจินกู/ซอมยอน',
      zh_TW: '釜山鎭區/西面',
      ja_JP: '釜山鎭區/西面',
      hi_IN: 'Busanjin-gu/Seomyeon',
      tl_PH: 'Busanjin-gu/Seomyeon',
      ar_SA: 'Busanjin-gu/Seomyeon',
      ru_RU: 'Busanjin-gu/Сомён',
    },
    '해운대/센텀': {
      ko_KR: '해운대/센텀',
      en_US: 'Haeundae/Centum',
      th_TH: 'แฮอุนแด/เซนทัม',
      zh_TW: '海雲臺/Centum',
      ja_JP: '海雲台/センタム',
      hi_IN: 'Haeundae/Centum',
      tl_PH: 'Haeundae/Centum',
      ar_SA: 'Haeundae/Centum',
      ru_RU: 'Хэундэ/Centum',
    },
    '중구/남포동/중앙동': {
      ko_KR: '중구/남포동/중앙동',
      en_US: 'Jung-gu/Nampo-dong/Jungang-dong',
      th_TH: 'จุงกู/นัมโพดง/จุงอังดง',
      zh_TW: '中區/南浦洞/中央洞',
      ja_JP: '中区/南浦洞/中央洞',
      hi_IN: 'Jung-gu/Nampo-dong/Jungang-dong',
      tl_PH: 'Jung-gu/Nampo-dong/Jungang-dong',
      ar_SA: 'Jung-gu/Nampo-dong/Jungang-dong',
      ru_RU: 'Чунгу/Нампходон/Чунъандон',
    },
  },
  인천: {
    '계양/부평': {
      ko_KR: '계양/부평',
      en_US: 'Gyeyang/Bupyeong',
      th_TH: 'คเยยัง/บูพยอง',
      zh_TW: '桂陽/富平',
      ja_JP: '桂陽/富平',
      hi_IN: 'Gyeyang/Bupyeong',
      tl_PH: 'Gyeyang/Bupyeong',
      ar_SA: 'Gyeyang/Bupyeong',
      ru_RU: 'Gyeyang/Пупхён',
    },
    '남동구/구월/논현': {
      ko_KR: '남동구/구월/논현',
      en_US: 'Namdong-gu/Guwol/Nonhyeon',
      th_TH: 'นัมดงกู/กูวอล/นอนฮยอน',
      zh_TW: '南洞區/九月/論峴',
      ja_JP: '南洞区/九月/論峴',
      hi_IN: 'Namdong-gu/Guwol/Nonhyeon',
      tl_PH: 'Namdong-gu/Guwol/Nonhyeon',
      ar_SA: 'Namdong-gu/Guwol/Nonhyeon',
      ru_RU: 'Намдонгу/Guwol/Нонхён',
    },
    '송도/연수': {
      ko_KR: '송도/연수',
      en_US: 'Songdo/Yeonsu',
      th_TH: 'ซองโด/ยอนซู',
      zh_TW: '松島/延壽',
      ja_JP: '松島/延寿',
      hi_IN: 'Songdo/Yeonsu',
      tl_PH: 'Songdo/Yeonsu',
      ar_SA: 'Songdo/Yeonsu',
      ru_RU: 'Сондо/Yeonsu',
    },
  },
  제주: {
    제주시: {
      ko_KR: '제주시',
      en_US: 'Jeju City',
      th_TH: 'เมืองเชจู',
      zh_TW: '濟州市',
      ja_JP: '濟州市',
      hi_IN: 'Jeju City',
      tl_PH: 'Jeju City',
      ar_SA: 'Jeju City',
      ru_RU: 'Чеджуси',
    },
    서귀포시: {
      ko_KR: '서귀포시',
      en_US: 'Seogwipo City',
      th_TH: 'เมืองซอกวิโพ',
      zh_TW: '西歸浦市',
      ja_JP: '西帰浦市',
      hi_IN: 'Seogwipo City',
      tl_PH: 'Seogwipo City',
      ar_SA: 'Seogwipo City',
      ru_RU: 'Согвипхоси',
    },
  },
};

/**
 * 모든 매핑된 지역명 목록 조회 (대분류 포함)
 */
export function getAllMappedDistrictNames(): string[] {
  const allNames: string[] = [];
  for (const category of Object.keys(DISTRICT_MAPPING) as MajorCategory[]) {
    for (const districtName of Object.keys(DISTRICT_MAPPING[category])) {
      allNames.push(districtName);
    }
  }
  return allNames;
}

/**
 * 한국어 지역명으로 매핑 정보 조회
 */
export function getDistrictMapping(koreanName: string): Record<Locale, string> | undefined {
  for (const category of Object.keys(DISTRICT_MAPPING) as MajorCategory[]) {
    if (koreanName in DISTRICT_MAPPING[category]) {
      return DISTRICT_MAPPING[category][koreanName];
    }
  }
  return undefined;
}

/**
 * 매핑 정보에 있는 지역명인지 확인
 */
export function isMappedDistrict(koreanName: string): boolean {
  return getDistrictMapping(koreanName) !== undefined;
}

/**
 * 대분류 매핑 정보 조회
 */
export function getMajorCategoryMapping(category: MajorCategory): Record<Locale, string> {
  return MAJOR_CATEGORY_MAPPING[category];
}
