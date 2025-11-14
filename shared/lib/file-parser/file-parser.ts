import { type FileData } from './types';

/**
 * File tag 패턴: <file url="..." name="..." size="..." type="..."></file>
 */
const FILE_TAG_REGEX =
  /<file\s+url="([^"]+)"(?:\s+name="([^"]*)")?(?:\s+size="([^"]*)")?(?:\s+type="([^"]*)")?\s*><\/file>/g;

/**
 * 메시지에서 file tag를 추출하고 파싱
 * @param message 메시지 내용
 * @returns file tag가 있으면 FileData 배열, 없으면 빈 배열
 */
export function extractFileTags(message: string): FileData[] {
  const matches = message.matchAll(FILE_TAG_REGEX);
  const files: FileData[] = [];

  for (const match of matches) {
    const url = match[1]?.trim();
    const fileName = match[2]?.trim();
    const fileSize = match[3] ? parseInt(match[3], 10) : undefined;
    const mimeType = match[4]?.trim();

    if (url) {
      files.push({
        url,
        fileName,
        fileSize,
        mimeType,
      });
    }
  }

  return files;
}

/**
 * 메시지에서 file tag를 제거
 * @param message 메시지 내용
 * @returns file tag가 제거된 메시지
 */
export function removeFileTags(message: string): string {
  return message.replace(FILE_TAG_REGEX, '').trim();
}

/**
 * 메시지에 file tag가 있는지 확인
 * @param message 메시지 내용
 * @returns file tag가 있으면 true
 */
export function hasFileTag(message: string): boolean {
  return FILE_TAG_REGEX.test(message);
}
