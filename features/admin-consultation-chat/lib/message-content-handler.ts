import { extractPictureTags, removePictureTags } from '@/shared/lib/image-parser';
import { extractFileTags, removeFileTags } from '@/shared/lib/file-parser';

export interface MessageContentAnalysis {
  pictures: Array<{ url: string }>;
  files: Array<{ url: string; fileName?: string; fileSize?: number; mimeType?: string }>;
  textWithoutPictures: string;
  textWithoutFiles: string;
  hasOnlyPictures: boolean;
  hasOnlyFiles: boolean;
  hasText: boolean;
}

/**
 * 메시지 내용을 분석하여 picture 태그, file 태그와 텍스트를 분리
 */
export function analyzeMessageContent(content: string): MessageContentAnalysis {
  const pictures = extractPictureTags(content);
  const textWithoutPictures = removePictureTags(content);

  const files = extractFileTags(textWithoutPictures);
  const textWithoutFiles = removeFileTags(textWithoutPictures);

  const hasOnlyPictures = pictures.length > 0 && !textWithoutFiles.trim() && files.length === 0;
  const hasOnlyFiles = files.length > 0 && !textWithoutFiles.trim() && pictures.length === 0;
  const hasText = !!textWithoutFiles.trim();

  return {
    pictures,
    files,
    textWithoutPictures,
    textWithoutFiles,
    hasOnlyPictures,
    hasOnlyFiles,
    hasText,
  };
}
