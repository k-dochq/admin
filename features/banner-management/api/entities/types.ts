import {
  type EventBanner,
  type EventBannerImage,
  type EventBannerLocale,
  type EventBannerType,
} from '@prisma/client';

// Prisma 타입 re-export
export type { EventBanner, EventBannerImage, EventBannerLocale, EventBannerType };

// Prisma 타입을 기반으로 한 확장 타입
export type EventBannerWithImages = EventBanner & {
  bannerImages: EventBannerImage[];
};

export type EventBannerImageWithBanner = EventBannerImage & {
  banner: EventBanner;
};

// 다국어 제목 타입 (EventBannerLocale을 사용하는 다국어 필드)
export type MultilingualTitle = Record<EventBannerLocale, string>;

// Request 타입들
export interface GetBannersRequest {
  page?: number;
  limit?: number;
  isActive?: boolean;
  type?: EventBannerType;
  orderBy?: 'createdAt' | 'order' | 'startDate';
  orderDirection?: 'asc' | 'desc';
}

export interface CreateBannerRequest {
  title: MultilingualTitle;
  linkUrl?: string | null;
  order: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  type?: EventBannerType;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  id: string;
}

export interface CreateBannerImageRequest {
  bannerId: string;
  locale: EventBannerLocale;
  imageUrl: string;
  alt?: string;
}

// Response 타입들
export interface GetBannersResponse {
  banners: EventBannerWithImages[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BannerResponse {
  banner: EventBannerWithImages;
}

export interface BannerImageResponse {
  image: EventBannerImageWithBanner;
}

// 상수 정의
export const IMAGE_LOCALE_LABELS: Record<EventBannerLocale, string> = {
  ko: '한국어',
  en: 'English',
  th: 'ไทย',
  zh: '繁體中文',
  ja: '日本語',
  hi: 'हिन्दी',
};

export const IMAGE_LOCALE_FLAGS: Record<EventBannerLocale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  th: '🇹🇭',
  zh: '🇹🇼',
  ja: '🇯🇵',
  hi: '🇮🇳',
};

// 이미지 업로드 관련 상수
export const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 배너 관련 상수
export const DEFAULT_BANNER_LIMIT = 20;
export const MAX_BANNER_ORDER = 999;
export const MIN_BANNER_ORDER = 0;

// 배너 타입 라벨
export const BANNER_TYPE_LABELS: Record<EventBannerType, string> = {
  MAIN: '메인배너',
  RIBBON: '띠배너',
};
