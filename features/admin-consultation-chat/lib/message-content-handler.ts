import { extractPictureTags, removePictureTags } from '@/shared/lib/image-parser';

export interface MessageContentAnalysis {
  pictures: Array<{ url: string }>;
  textWithoutPictures: string;
  hasOnlyPictures: boolean;
  hasText: boolean;
}

/**
 * 메시지 내용을 분석하여 picture 태그와 텍스트를 분리
 */
export function analyzeMessageContent(content: string): MessageContentAnalysis {
  const pictures = extractPictureTags(content);
  const textWithoutPictures = removePictureTags(content);
  const hasOnlyPictures = pictures.length > 0 && !textWithoutPictures.trim();
  const hasText = !!textWithoutPictures.trim();

  return {
    pictures,
    textWithoutPictures,
    hasOnlyPictures,
    hasText,
  };
}
