'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드에서 사용할 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Admin 앱에서는 세션 유지 불필요
  },
});

export interface UploadImageParams {
  file: File;
  hospitalId: string;
  imageType: string;
}

export interface UploadBannerImageParams {
  file: File;
  bannerId: string;
  locale: 'ko' | 'en' | 'th';
}

export interface UploadReviewImageParams {
  file: File;
  reviewId: string;
  imageType: 'BEFORE' | 'AFTER';
}

export interface UploadLiveReviewImageParams {
  file: File;
  liveReviewId: string;
}

export interface UploadDoctorImageParams {
  file: File;
  doctorId: string;
  imageType: 'PROFILE' | 'CAREER';
}

export interface UploadYoutubeVideoThumbnailParams {
  file: File;
  videoId: string;
  locale: 'ko' | 'en' | 'th';
}

export interface UploadImageResult {
  success: boolean;
  imageUrl?: string;
  path?: string;
  error?: string;
}

/**
 * 클라이언트 사이드에서 병원 이미지를 Supabase Storage에 업로드
 */
export async function uploadHospitalImageClient({
  file,
  hospitalId,
  imageType,
}: UploadImageParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: hospitals/{hospitalId}/{imageType}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `hospitals/${hospitalId}/${imageType.toLowerCase()}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload hospital image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 이미지 삭제
 */
export async function deleteHospitalImageClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete hospital image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 리뷰 이미지를 Supabase Storage에 업로드
 */
export async function uploadReviewImageClient({
  file,
  reviewId,
  imageType,
}: UploadReviewImageParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: reviews/{reviewId}/{imageType}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `reviews/${reviewId}/${imageType.toLowerCase()}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload review image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 생생후기 이미지를 Supabase Storage에 업로드
 */
export async function uploadLiveReviewImageClient({
  file,
  liveReviewId,
}: UploadLiveReviewImageParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: live-reviews/{liveReviewId}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `live-reviews/${liveReviewId}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload live review image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 공지사항 파일을 Supabase Storage에 업로드
 */
export async function uploadNoticeFileClient({
  file,
  noticeId,
  fileType,
}: {
  file: File;
  noticeId: string;
  fileType: 'IMAGE' | 'ATTACHMENT';
}): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 파일 타입별 검증
    if (fileType === 'IMAGE') {
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: '이미지 파일만 업로드할 수 있습니다.',
        };
      }
    }

    // 파일 크기 확인 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 10MB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: notices/{noticeId}/{fileType}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `notices/${noticeId}/${fileType.toLowerCase()}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload notice file error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 공지사항 파일 삭제
 */
export async function deleteNoticeFileClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete notice file error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 리뷰 이미지 삭제
 */
export async function deleteReviewImageClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete review image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 의사 이미지를 Supabase Storage에 업로드
 */
export async function uploadDoctorImageClient({
  file,
  doctorId,
  imageType,
}: UploadDoctorImageParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: doctors/{doctorId}/{imageType}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `doctors/${doctorId}/${imageType.toLowerCase()}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload doctor image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 의사 이미지 삭제
 */
export async function deleteDoctorImageClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete doctor image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 배너 이미지를 Supabase Storage에 업로드
 */
export async function uploadBannerImageClient({
  file,
  bannerId,
  locale,
}: UploadBannerImageParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: event-banners/{bannerId}/{locale}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `event-banners/${bannerId}/${locale}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload banner image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 배너 이미지 삭제
 */
export async function deleteBannerImageClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete banner image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 YouTube 영상 썸네일을 Supabase Storage에 업로드
 */
export async function uploadYoutubeVideoThumbnailClient({
  file,
  videoId,
  locale,
}: UploadYoutubeVideoThumbnailParams): Promise<UploadImageResult> {
  try {
    // 파일 유효성 검사
    if (!file || !file.name) {
      return {
        success: false,
        error: '유효하지 않은 파일입니다.',
      };
    }

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드할 수 있습니다.',
      };
    }

    // 파일 크기 확인 (500KB 제한)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 500KB를 초과합니다.',
      };
    }

    // 스토리지 경로 생성: youtube-videos/{videoId}/{locale}/{uuid}.{ext}
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const path = `youtube-videos/${videoId}/${locale}/${fileName}`;

    // Supabase Storage에 직접 업로드
    const { error } = await supabase.storage.from('kdoc-storage').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: `업로드 실패: ${error.message}`,
      };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('kdoc-storage').getPublicUrl(path);

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      path,
    };
  } catch (error) {
    console.error('Upload youtube video thumbnail error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 클라이언트 사이드에서 Supabase Storage의 YouTube 영상 썸네일 삭제
 */
export async function deleteYoutubeVideoThumbnailClient(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('kdoc-storage').remove([path]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      return {
        success: false,
        error: `삭제 실패: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete youtube video thumbnail error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
