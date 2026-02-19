import { ALL_LOCALES } from '@/shared/lib/types/locale';
import type { HospitalLocale } from '../../LanguageTabs';
import type { HospitalImage } from '../../../api/entities/types';
import {
  jsonToLocaleStringRecord,
  createInitialVideoLinks,
  createInitialVideoTitles,
} from '../types';

export interface VideoFormState {
  videoLinks: Record<HospitalLocale, string>;
  videoTitles: Record<HospitalLocale, string>;
}

/**
 * k-doc와 동일한 데이터 바인딩: 첫 번째 VIDEO 행만 사용한다.
 * - URL: localizedLinks[locale]가 있으면 사용, 없으면 fallbackUrl(first.imageUrl) 사용
 * - 제목: 첫 행의 title (로케일별)
 * @see k-doc app/api/hospitals/[id]/videos/route.ts (video = videoImages[0])
 * @see k-doc getLocalizedVideoUrl(localizedLinks, fallbackUrl, lang)
 */
export function getVideoFormStateFromImages(
  videoImages: HospitalImage[],
): VideoFormState {
  if (videoImages.length === 0) {
    return {
      videoLinks: createInitialVideoLinks(),
      videoTitles: createInitialVideoTitles(),
    };
  }

  const first = videoImages[0];
  const localizedLinks = first.localizedLinks as Record<string, string> | null | undefined;
  const fallbackUrl = first.imageUrl?.trim() ?? '';

  const videoLinks = Object.fromEntries(
    ALL_LOCALES.map((locale) => {
      const url = localizedLinks?.[locale];
      const value =
        typeof url === 'string' && url.trim() !== '' ? url.trim() : fallbackUrl;
      return [locale, value];
    }),
  ) as Record<HospitalLocale, string>;

  const videoTitles = jsonToLocaleStringRecord(
    first.title as Record<string, string> | null,
  );

  return { videoLinks, videoTitles };
}
