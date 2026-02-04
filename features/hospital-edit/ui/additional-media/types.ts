import type { HospitalLocale } from '../LanguageTabs';

export type MediaTabType = 'PROCEDURE_DETAIL' | 'VIDEO_THUMBNAIL' | 'VIDEO';

const HOSPITAL_LOCALES: readonly HospitalLocale[] = [
  'ko_KR',
  'en_US',
  'th_TH',
  'zh_TW',
  'ja_JP',
  'hi_IN',
  'tl_PH',
  'ar_SA',
];

export interface FileWithPreview extends File {
  preview: string;
  id: string;
  error?: string;
}

export const MEDIA_TAB_TYPES: MediaTabType[] = ['PROCEDURE_DETAIL', 'VIDEO_THUMBNAIL', 'VIDEO'];

export const MEDIA_TAB_LABELS: Record<MediaTabType, string> = {
  PROCEDURE_DETAIL: '시술상세이미지',
  VIDEO_THUMBNAIL: '영상썸네일이미지',
  VIDEO: '영상링크',
};

export function createInitialSelectedFiles(): Record<
  MediaTabType,
  Record<HospitalLocale, FileWithPreview[]>
> {
  const emptyLocaleFiles = (): Record<HospitalLocale, FileWithPreview[]> =>
    Object.fromEntries(
      HOSPITAL_LOCALES.map((locale) => [locale, [] as FileWithPreview[]]),
    ) as unknown as Record<HospitalLocale, FileWithPreview[]>;

  return {
    PROCEDURE_DETAIL: emptyLocaleFiles(),
    VIDEO_THUMBNAIL: emptyLocaleFiles(),
    VIDEO: emptyLocaleFiles(),
  };
}

/** Json(로케일 키 → 문자열)을 Record<HospitalLocale, string>으로 변환. 없거나 문자열이 아니면 '' */
export function jsonToLocaleStringRecord(
  json: Record<string, string> | null | undefined,
): Record<HospitalLocale, string> {
  const obj = json ?? {};
  return Object.fromEntries(
    HOSPITAL_LOCALES.map((locale) => [
      locale,
      typeof obj[locale] === 'string' && obj[locale].trim() !== '' ? obj[locale] : '',
    ]),
  ) as Record<HospitalLocale, string>;
}

function createEmptyLocaleStringRecord(): Record<HospitalLocale, string> {
  return Object.fromEntries(HOSPITAL_LOCALES.map((locale) => [locale, ''])) as Record<
    HospitalLocale,
    string
  >;
}

export function createInitialVideoLinks(): Record<HospitalLocale, string> {
  return createEmptyLocaleStringRecord();
}

export function createInitialVideoTitles(): Record<HospitalLocale, string> {
  return createEmptyLocaleStringRecord();
}

export function createInitialUploading(): Record<MediaTabType, Record<HospitalLocale, boolean>> {
  const falseByLocale = (): Record<HospitalLocale, boolean> =>
    Object.fromEntries(HOSPITAL_LOCALES.map((locale) => [locale, false])) as Record<
      HospitalLocale,
      boolean
    >;

  return {
    PROCEDURE_DETAIL: falseByLocale(),
    VIDEO_THUMBNAIL: falseByLocale(),
    VIDEO: falseByLocale(),
  };
}

export function createInitialSavingVideoLink(): Record<HospitalLocale, boolean> {
  return Object.fromEntries(HOSPITAL_LOCALES.map((locale) => [locale, false])) as Record<
    HospitalLocale,
    boolean
  >;
}

export function createInitialFileInputRefs(): Record<
  MediaTabType,
  Record<HospitalLocale, HTMLInputElement | null>
> {
  const nullByLocale = (): Record<HospitalLocale, HTMLInputElement | null> =>
    Object.fromEntries(HOSPITAL_LOCALES.map((locale) => [locale, null])) as Record<
      HospitalLocale,
      HTMLInputElement | null
    >;

  return {
    PROCEDURE_DETAIL: nullByLocale(),
    VIDEO_THUMBNAIL: nullByLocale(),
    VIDEO: nullByLocale(),
  };
}
