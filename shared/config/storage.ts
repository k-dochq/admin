/**
 * Supabase Storage 설정 상수
 */
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'kdoc-storage',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * 스토리지 경로 상수
 */
export const STORAGE_PATHS = {
  CHAT_IMAGES: 'chat-images',
  CHAT_DOCUMENTS: 'chat-documents',
  REVIEW_CREATE_BEFORE: 'review-create/before',
  REVIEW_CREATE_AFTER: 'review-create/after',
} as const;
