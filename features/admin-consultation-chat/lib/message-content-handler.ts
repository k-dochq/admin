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
  hasEditor: boolean;
  editorContent?: string;
}

/**
 * <editor> 태그 추출
 */
export function extractEditorTag(content: string): string | null {
  const editorMatch = content.match(/<editor>(.*?)<\/editor>/s);
  return editorMatch ? editorMatch[1] : null;
}

/**
 * <editor> 태그 제거
 */
export function removeEditorTag(content: string): string {
  return content.replace(/<editor>.*?<\/editor>/s, '');
}

/**
 * 메시지 내용을 분석하여 picture 태그, file 태그, editor 태그와 텍스트를 분리
 */
export function analyzeMessageContent(content: string): MessageContentAnalysis {
  const editorContent = extractEditorTag(content);
  const hasEditor = editorContent !== null;
  const contentWithoutEditor = hasEditor ? removeEditorTag(content) : content;

  const pictures = extractPictureTags(contentWithoutEditor);
  const textWithoutPictures = removePictureTags(contentWithoutEditor);

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
    hasEditor,
    editorContent: editorContent || undefined,
  };
}
