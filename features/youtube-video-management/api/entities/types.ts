import {
  YoutubeVideo,
  YoutubeVideoCategory,
  YoutubeVideoThumbnail,
  type YoutubeVideoLocale,
  Prisma,
} from '@prisma/client';

// 요청 타입들
export interface GetYoutubeVideoCategoriesRequest {
  isActive?: boolean;
}

export interface CreateYoutubeVideoCategoryRequest {
  name: Prisma.JsonValue;
  description?: Prisma.JsonValue | null;
  order?: number | null;
  isActive?: boolean;
}

export interface UpdateYoutubeVideoCategoryRequest {
  name?: Prisma.JsonValue;
  description?: Prisma.JsonValue | null;
  order?: number | null;
  isActive?: boolean;
}

export interface GetYoutubeVideosRequest {
  page?: number;
  limit?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface CreateYoutubeVideoRequest {
  categoryId: string;
  title: Prisma.JsonValue;
  description?: Prisma.JsonValue | null;
  videoUrl: Prisma.JsonValue;
  order?: number | null;
  isActive?: boolean;
}

export interface UpdateYoutubeVideoRequest {
  categoryId?: string;
  title?: Prisma.JsonValue;
  description?: Prisma.JsonValue | null;
  videoUrl?: Prisma.JsonValue;
  order?: number | null;
  isActive?: boolean;
}

// 응답 타입들
export interface GetYoutubeVideoCategoriesResponse {
  categories: YoutubeVideoCategoryForList[];
}

export interface GetYoutubeVideosResponse {
  videos: YoutubeVideoForList[];
  total: number;
  page: number;
  limit: number;
}

// 도메인 엔티티 타입들
export type YoutubeVideoCategoryForList = YoutubeVideoCategory & {
  _count: {
    videos: number;
  };
};

export type YoutubeVideoCategoryForForm = YoutubeVideoCategory;

export type YoutubeVideoForList = Pick<
  YoutubeVideo,
  | 'id'
  | 'categoryId'
  | 'title'
  | 'description'
  | 'videoUrl'
  | 'order'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
> & {
  category: Pick<YoutubeVideoCategory, 'id' | 'name'>;
  thumbnails: Array<{
    id: string;
    locale: string;
    imageUrl: string;
    alt: string | null;
  }>;
  _count: {
    thumbnails: number;
  };
};

export type YoutubeVideoForForm = YoutubeVideo & {
  category: Pick<YoutubeVideoCategory, 'id' | 'name'>;
  thumbnails: YoutubeVideoThumbnail[];
};

export type YoutubeVideoThumbnailData = {
  id: string;
  videoId: string;
  locale: YoutubeVideoLocale;
  imageUrl: string;
  alt: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type { YoutubeVideoLocale };

export type LocalizedText = {
  ko?: string;
  en?: string;
  th?: string;
  zh?: string;
  ja?: string;
};
