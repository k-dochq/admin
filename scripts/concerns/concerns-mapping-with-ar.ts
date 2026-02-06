/**
 * 고민부위 매핑 정보 (아랍어 ar_SA 포함)
 * 통합 매핑(concerns-mapping-unified)에서 re-export
 */

import {
  CONCERN_MAPPINGS_UNIFIED,
  CONCERN_KO_TO_AR_SA,
  findArSaByKoTag,
} from './concerns-mapping-unified';

export type ConcernLocaleWithAr =
  | 'en_US'
  | 'th_TH'
  | 'zh_TW'
  | 'ja_JP'
  | 'hi_IN'
  | 'tl_PH'
  | 'ar_SA';

export type ConcernMappingWithAr = {
  category: string;
  ko_KR: string;
  en_US: string;
  th_TH: string;
  zh_TW: string;
  ja_JP: string;
  hi_IN: string;
  tl_PH: string;
  ar_SA: string;
};

/** 통합 매핑에서 ar_SA까지 포함한 배열 (ru_RU 포함된 통합 소스 사용) */
export const CONCERN_MAPPINGS_WITH_AR: ConcernMappingWithAr[] = CONCERN_MAPPINGS_UNIFIED;

export { CONCERN_KO_TO_AR_SA, findArSaByKoTag };
