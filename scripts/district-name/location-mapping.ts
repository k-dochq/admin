/**
 * 표시지역명 매핑 정보
 *
 * 병원의 displayLocationName 필드에 사용되는 지역명의 다국어 매핑 정보
 */

import type { Locale } from './types';

// 표시지역명 매핑 정보
export const LOCATION_NAME_MAPPING: Record<string, Record<Locale, string>> = {
  논현동: {
    ko_KR: '논현동',
    en_US: 'Nonhyeon',
    th_TH: 'นอนฮยอน',
    zh_TW: '論峴',
    ja_JP: 'ノンヒョンドン',
    hi_IN: 'Nonhyeon',
    tl_PH: 'Nonhyeon',
    ar_SA: 'Nonhyeon',
    ru_RU: 'Нонхён',
  },
  역삼동: {
    ko_KR: '역삼동',
    en_US: 'Yeoksam',
    th_TH: 'ยอกซัม',
    zh_TW: '驛三',
    ja_JP: '駅三',
    hi_IN: 'Yeoksam',
    tl_PH: 'Yeoksam',
    ar_SA: 'Yeoksam',
    ru_RU: 'Ёксам',
  },
  신사동: {
    ko_KR: '신사동',
    en_US: 'Sinsa',
    th_TH: 'ชินซา',
    zh_TW: '新沙',
    ja_JP: '新沙',
    hi_IN: 'Sinsa',
    tl_PH: 'Sinsa',
    ar_SA: 'Sinsa',
    ru_RU: 'Sinsa',
  },
  반포동: {
    ko_KR: '반포동',
    en_US: 'Banpo',
    th_TH: 'บันโพ',
    zh_TW: '半浦',
    ja_JP: 'バンポ',
    hi_IN: 'Banpo',
    tl_PH: 'Banpo',
    ar_SA: 'Banpo',
    ru_RU: 'Банпо',
  },
  서초동: {
    ko_KR: '서초동',
    en_US: 'Seocho',
    th_TH: 'ซอโช',
    zh_TW: '瑞草',
    ja_JP: '瑞草',
    hi_IN: 'Seocho',
    tl_PH: 'Seocho',
    ar_SA: 'Seocho',
    ru_RU: 'Сочхо',
  },
  청담동: {
    ko_KR: '청담동',
    en_US: 'Cheongdam',
    th_TH: 'ชองดัม',
    zh_TW: '清潭',
    ja_JP: '清潭',
    hi_IN: 'Cheongdam',
    tl_PH: 'Cheongdam',
    ar_SA: 'Cheongdam',
    ru_RU: 'Чхондэм',
  },
  압구정: {
    ko_KR: '압구정',
    en_US: 'Apgujeong',
    th_TH: 'อับกูจอง',
    zh_TW: '狎鷗亭',
    ja_JP: 'アックジョン',
    hi_IN: 'Apgujeong',
    tl_PH: 'Apgujeong',
    ar_SA: 'Apgujeong',
    ru_RU: 'Апгуджон',
  },
  문정동: {
    ko_KR: '문정동',
    en_US: 'Munjeong',
    th_TH: 'มุนจอง',
    zh_TW: '文井',
    ja_JP: 'ムンジョン',
    hi_IN: 'Munjeong',
    tl_PH: 'Munjeong',
    ar_SA: 'Munjeong',
    ru_RU: 'Мунджон',
  },
  여의도동: {
    ko_KR: '여의도동',
    en_US: 'Yeouido',
    th_TH: 'ยออีโด',
    zh_TW: '汝矣島',
    ja_JP: 'ヨイド',
    hi_IN: 'Yeouido',
    tl_PH: 'Yeouido',
    ar_SA: 'Yeouido',
    ru_RU: 'Ёыйдо',
  },
  삼성동: {
    ko_KR: '삼성동',
    en_US: 'Samseong',
    th_TH: 'Samseong',
    zh_TW: '三成',
    ja_JP: 'サムソンドン',
    hi_IN: 'Samseong',
    tl_PH: 'Samseong',
    ar_SA: 'Samseong',
    ru_RU: 'Samseong',
  },
};

/**
 * 한국어 지역명으로 매핑 정보 조회
 */
export function getLocationMapping(koreanName: string): Record<Locale, string> | undefined {
  return LOCATION_NAME_MAPPING[koreanName];
}

/**
 * 매핑 정보에 있는 지역명인지 확인
 */
export function isMappedLocation(koreanName: string): boolean {
  return koreanName in LOCATION_NAME_MAPPING;
}

/**
 * 지원하는 모든 지역명 목록 조회
 */
export function getMappedLocationNames(): string[] {
  return Object.keys(LOCATION_NAME_MAPPING);
}
