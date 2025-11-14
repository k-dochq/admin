import { supabase } from '@/shared/lib/supabase-client';
import { STORAGE_CONFIG, STORAGE_PATHS } from '@/shared/config/storage';
import { isSupportedFileType, isImageType } from '@/shared/config/file-types';

export interface UploadChatFileParams {
  file: File;
  userId: string;
}

export interface UploadChatFileResult {
  success: boolean;
  url?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

export class ChatFileUploadService {
  private readonly bucketName = STORAGE_CONFIG.BUCKET_NAME;
  private readonly maxFileSize = STORAGE_CONFIG.MAX_FILE_SIZE;

  /**
   * 채팅 파일(이미지 또는 문서)을 Supabase Storage에 업로드
   */
  async uploadFile({ file, userId }: UploadChatFileParams): Promise<UploadChatFileResult> {
    try {
      // 파일 크기 검증
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          error: 'File size exceeds 10MB limit',
        };
      }

      // MIME 타입 검증
      if (!isSupportedFileType(file.type)) {
        return {
          success: false,
          error: 'Unsupported file type',
        };
      }

      // 파일 확장자 추출
      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        return {
          success: false,
          error: 'Invalid file extension',
        };
      }

      // 파일명 생성: {userId}_{timestamp}_{uuid}.{ext}
      const timestamp = Date.now();
      const randomId = crypto.randomUUID();
      const fileName = `${userId}_${timestamp}_${randomId}.${fileExt}`;

      // 파일 타입에 따라 저장 경로 결정
      const isImage = isImageType(file.type);
      const storagePath = isImage ? STORAGE_PATHS.CHAT_IMAGES : STORAGE_PATHS.CHAT_DOCUMENTS;
      const filePath = `${storagePath}/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage.from(this.bucketName).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Public URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.bucketName).getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error('Upload chat file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(this.bucketName).remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete chat file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
