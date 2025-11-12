'use client';

import { useState, useCallback } from 'react';
import { ChatImageUploadService } from '../api/infrastructure/services/chat-image-upload-service';

interface UseChatImageUploadResult {
  isUploading: boolean;
  uploadError: string | null;
  uploadImage: (file: File) => Promise<string | null>;
  clearError: () => void;
}

export function useChatImageUpload(userId: string): UseChatImageUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadService = new ChatImageUploadService();

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!file) {
        setUploadError('파일을 선택해주세요');
        return null;
      }

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('파일 크기는 10MB 이하여야 합니다');
        return null;
      }

      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        setUploadError('이미지 파일만 업로드 가능합니다');
        return null;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await uploadService.uploadImage({
          file,
          userId,
        });

        if (!result.success || !result.url) {
          throw new Error(result.error || '업로드에 실패했습니다');
        }

        return result.url;
      } catch (error) {
        console.error('Image upload error:', error);
        const errorMessage =
          error instanceof Error ? error.message : '이미지 업로드에 실패했습니다';
        setUploadError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [userId, uploadService],
  );

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    uploadImage,
    clearError,
  };
}
