import type { HospitalLocale } from '../LanguageTabs';

export type MediaTabType = 'PROCEDURE_DETAIL' | 'VIDEO_THUMBNAIL' | 'VIDEO';

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
  const locales = [
    'ko_KR',
    'en_US',
    'th_TH',
    'zh_TW',
    'ja_JP',
    'hi_IN',
    'tl_PH',
    'ar_SA',
  ] as const satisfies readonly HospitalLocale[];
  const emptyLocaleFiles = (): Record<HospitalLocale, FileWithPreview[]> =>
    Object.fromEntries(
      locales.map((locale) => [locale, [] as FileWithPreview[]]),
    ) as unknown as Record<HospitalLocale, FileWithPreview[]>;

  return {
    PROCEDURE_DETAIL: emptyLocaleFiles(),
    VIDEO_THUMBNAIL: emptyLocaleFiles(),
    VIDEO: emptyLocaleFiles(),
  };
}

export function createInitialVideoLinks(): Record<HospitalLocale, string> {
  return Object.fromEntries(
    (['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'] as const).map(
      (locale) => [locale, ''],
    ),
  ) as Record<HospitalLocale, string>;
}

export function createInitialVideoTitles(): Record<HospitalLocale, string> {
  return Object.fromEntries(
    (['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'] as const).map(
      (locale) => [locale, ''],
    ),
  ) as Record<HospitalLocale, string>;
}

export function createInitialUploading(): Record<MediaTabType, Record<HospitalLocale, boolean>> {
  const falseByLocale = (): Record<HospitalLocale, boolean> =>
    Object.fromEntries(
      (['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'] as const).map(
        (locale) => [locale, false],
      ),
    ) as Record<HospitalLocale, boolean>;

  return {
    PROCEDURE_DETAIL: falseByLocale(),
    VIDEO_THUMBNAIL: falseByLocale(),
    VIDEO: falseByLocale(),
  };
}

export function createInitialSavingVideoLink(): Record<HospitalLocale, boolean> {
  return Object.fromEntries(
    (['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'] as const).map(
      (locale) => [locale, false],
    ),
  ) as Record<HospitalLocale, boolean>;
}

export function createInitialFileInputRefs(): Record<
  MediaTabType,
  Record<HospitalLocale, HTMLInputElement | null>
> {
  const nullByLocale = (): Record<HospitalLocale, HTMLInputElement | null> =>
    Object.fromEntries(
      (['ko_KR', 'en_US', 'th_TH', 'zh_TW', 'ja_JP', 'hi_IN', 'tl_PH', 'ar_SA'] as const).map(
        (locale) => [locale, null],
      ),
    ) as Record<HospitalLocale, HTMLInputElement | null>;

  return {
    PROCEDURE_DETAIL: nullByLocale(),
    VIDEO_THUMBNAIL: nullByLocale(),
    VIDEO: nullByLocale(),
  };
}
