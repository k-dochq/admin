import { supabase } from '@/shared/lib/supabase-client';
import { STORAGE_CONFIG, STORAGE_PATHS } from '@/shared/config/storage';

export interface UploadChatImageParams {
  file: File;
  userId: string;
}

export interface UploadChatImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ChatImageUploadService {
  private readonly bucketName = STORAGE_CONFIG.BUCKET_NAME;
  private readonly maxFileSize = STORAGE_CONFIG.MAX_FILE_SIZE;

  /**
   * 채팅 이미지를 Supabase Storage에 업로드
   */
  async uploadImage({ file, userId }: UploadChatImageParams): Promise<UploadChatImageResult> {
    try {
      // 파일 크기 검증
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          error: 'File size exceeds 10MB limit',
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
      const filePath = `${STORAGE_PATHS.CHAT_IMAGES}/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage.from(this.bucketName).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
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
      };
    } catch (error) {
      console.error('Upload chat image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(filePath: string): Promise<{ success: boolean; error?: string }> {
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
      console.error('Delete chat image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
