/**
 * 지원되는 파일 타입 상수
 */
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  PDF: ['application/pdf'],
  WORD: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  EXCEL: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  POWERPOINT: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  TEXT: ['text/plain', 'text/csv'],
} as const;

/**
 * 모든 지원되는 MIME 타입 배열
 */
export const ALL_SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_FILE_TYPES.IMAGE,
  ...SUPPORTED_FILE_TYPES.PDF,
  ...SUPPORTED_FILE_TYPES.WORD,
  ...SUPPORTED_FILE_TYPES.EXCEL,
  ...SUPPORTED_FILE_TYPES.POWERPOINT,
  ...SUPPORTED_FILE_TYPES.TEXT,
] as const;

/**
 * 지원되는 MIME 타입 유니온 타입
 */
export type SupportedMimeType = (typeof ALL_SUPPORTED_MIME_TYPES)[number];

/**
 * 파일 확장자별 아이콘 매핑
 */
export const FILE_TYPE_ICONS = {
  // 이미지
  'image/jpeg': '🖼️',
  'image/jpg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'image/svg+xml': '🖼️',

  // PDF
  'application/pdf': '📄',

  // Word
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',

  // Excel
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',

  // PowerPoint
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',

  // Text
  'text/plain': '📃',
  'text/csv': '📋',
} as const;

/**
 * 파일 확장자별 색상 매핑
 */
export const FILE_TYPE_COLORS = {
  // 이미지
  image: '#10B981', // green

  // PDF
  pdf: '#EF4444', // red

  // Word
  word: '#3B82F6', // blue

  // Excel
  excel: '#22C55E', // green

  // PowerPoint
  powerpoint: '#F97316', // orange

  // Text
  text: '#6B7280', // gray
} as const;

/**
 * MIME 타입이 이미지인지 확인
 */
export function isImageType(
  mimeType: string,
): mimeType is (typeof SUPPORTED_FILE_TYPES.IMAGE)[number] {
  return (SUPPORTED_FILE_TYPES.IMAGE as readonly string[]).includes(mimeType);
}

/**
 * MIME 타입이 문서인지 확인
 */
export function isDocumentType(mimeType: string): boolean {
  return (
    (SUPPORTED_FILE_TYPES.PDF as readonly string[]).includes(mimeType) ||
    (SUPPORTED_FILE_TYPES.WORD as readonly string[]).includes(mimeType) ||
    (SUPPORTED_FILE_TYPES.EXCEL as readonly string[]).includes(mimeType) ||
    (SUPPORTED_FILE_TYPES.POWERPOINT as readonly string[]).includes(mimeType) ||
    (SUPPORTED_FILE_TYPES.TEXT as readonly string[]).includes(mimeType)
  );
}

/**
 * MIME 타입이 지원되는지 확인
 */
export function isSupportedFileType(mimeType: string): mimeType is SupportedMimeType {
  return (ALL_SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * MIME 타입에서 파일 타입 카테고리 가져오기
 */
export function getFileTypeCategory(
  mimeType: string,
): 'image' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'text' | 'unknown' {
  if ((SUPPORTED_FILE_TYPES.IMAGE as readonly string[]).includes(mimeType)) return 'image';
  if ((SUPPORTED_FILE_TYPES.PDF as readonly string[]).includes(mimeType)) return 'pdf';
  if ((SUPPORTED_FILE_TYPES.WORD as readonly string[]).includes(mimeType)) return 'word';
  if ((SUPPORTED_FILE_TYPES.EXCEL as readonly string[]).includes(mimeType)) return 'excel';
  if ((SUPPORTED_FILE_TYPES.POWERPOINT as readonly string[]).includes(mimeType))
    return 'powerpoint';
  if ((SUPPORTED_FILE_TYPES.TEXT as readonly string[]).includes(mimeType)) return 'text';
  return 'unknown';
}

/**
 * MIME 타입에서 아이콘 가져오기
 */
export function getFileIcon(mimeType: string): string {
  return FILE_TYPE_ICONS[mimeType as keyof typeof FILE_TYPE_ICONS] || '📎';
}

/**
 * 파일 타입 카테고리에서 색상 가져오기
 */
export function getFileColor(category: ReturnType<typeof getFileTypeCategory>): string {
  switch (category) {
    case 'image':
      return FILE_TYPE_COLORS.image;
    case 'pdf':
      return FILE_TYPE_COLORS.pdf;
    case 'word':
      return FILE_TYPE_COLORS.word;
    case 'excel':
      return FILE_TYPE_COLORS.excel;
    case 'powerpoint':
      return FILE_TYPE_COLORS.powerpoint;
    case 'text':
      return FILE_TYPE_COLORS.text;
    default:
      return '#6B7280'; // gray
  }
}

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 파일 accept 속성 문자열 생성
 */
export function getAcceptString(): string {
  return [
    'image/*',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
  ].join(',');
}
