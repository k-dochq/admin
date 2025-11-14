'use client';

import { useState, useCallback } from 'react';
import { ChatFileUploadService } from '../api/infrastructure/services/chat-file-upload-service';
import { isSupportedFileType } from '@/shared/config/file-types';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface UseChatFileUploadResult {
  isUploading: boolean;
  uploadError: string | null;
  uploadFile: (file: File) => Promise<UploadResult | null>;
  clearError: () => void;
}

export function useChatFileUpload(userId: string): UseChatFileUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadService = new ChatFileUploadService();

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      if (!file) {
        setUploadError('파일을 선택해주세요');
        return null;
      }

      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('파일 크기는 10MB 이하여야 합니다');
        return null;
      }

      // 지원되는 파일 타입 검증
      if (!isSupportedFileType(file.type)) {
        setUploadError('지원되지 않는 파일 형식입니다');
        return null;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await uploadService.uploadFile({
          file,
          userId,
        });

        if (!result.success || !result.url) {
          throw new Error(result.error || '업로드에 실패했습니다');
        }

        return {
          url: result.url,
          fileName: result.fileName || file.name,
          fileSize: result.fileSize || file.size,
          mimeType: result.mimeType || file.type,
        };
      } catch (error) {
        console.error('File upload error:', error);
        const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다';
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
    uploadFile,
    clearError,
  };
}
