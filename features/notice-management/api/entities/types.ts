import { Prisma } from '@prisma/client';
import { type LocalizedText } from '@/shared/lib/types/locale';
import { parseLocalizedText as sharedParseLocalizedText } from '@/shared/lib/utils/locale-utils';

// 다국어 텍스트 타입 (공통 타입 사용)
export type { LocalizedText };

// 공지사항 파일 타입
export type NoticeFileType = 'IMAGE' | 'ATTACHMENT';

// 공지사항 타입
export type NoticeType = 'INFO' | 'EVENT';

// Prisma에서 생성된 타입 사용
export type Notice = Prisma.NoticeGetPayload<{}>;
export type NoticeFile = Prisma.NoticeFileGetPayload<{}>;

// 공지사항과 파일을 포함한 타입
export type NoticeWithFiles = Prisma.NoticeGetPayload<{
  include: {
    noticeFiles: true;
  };
}>;

// 공지사항 목록 조회 요청
export interface GetNoticesRequest {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

// 공지사항 목록 조회 응답
export interface GetNoticesResponse {
  notices: NoticeWithFiles[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 공지사항 생성 요청
export interface CreateNoticeRequest {
  title: LocalizedText;
  content: LocalizedText;
  type?: NoticeType;
  isActive?: boolean;
  createdBy?: string;
}

// 공지사항 수정 요청
export interface UpdateNoticeRequest {
  id: string;
  title?: LocalizedText;
  content?: LocalizedText;
  type?: NoticeType;
  isActive?: boolean;
  updatedBy?: string;
}

// 공지사항 삭제 요청
export interface DeleteNoticeRequest {
  id: string;
}

// 파일 업로드 요청
export interface UploadNoticeFileRequest {
  noticeId: string;
  fileType: NoticeFileType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  alt?: string;
  order?: number;
}

// 파일 삭제 요청
export interface DeleteNoticeFileRequest {
  noticeId: string;
  fileId: string;
}

// 유틸리티 함수들
export const parseJsonValueToLocalizedText = (value: Prisma.JsonValue): LocalizedText => {
  const parsed = sharedParseLocalizedText(value);
  return {
    ko_KR: parsed.ko_KR || '',
    en_US: parsed.en_US || '',
    th_TH: parsed.th_TH || '',
    zh_TW: parsed.zh_TW || '',
    ja_JP: parsed.ja_JP || '',
    hi_IN: parsed.hi_IN || '',
    tl_PH: parsed.tl_PH || '',
  };
};

export const parseLocalizedTextToJsonValue = (text: LocalizedText): Prisma.JsonValue => {
  return text;
};

export const getLocalizedTextValue = (
  value: Prisma.JsonValue,
  locale: keyof LocalizedText = 'ko_KR',
): string => {
  const localizedText = parseJsonValueToLocalizedText(value);
  return localizedText[locale] || '';
};
