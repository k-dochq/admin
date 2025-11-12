import { type ImageData } from './types';

/**
 * Picture tag 패턴: <picture>{url}</picture>
 */
const PICTURE_TAG_REGEX = /<picture>([^<]+)<\/picture>/g;

/**
 * 메시지에서 picture tag를 추출하고 파싱
 * @param message 메시지 내용
 * @returns picture tag가 있으면 ImageData 배열, 없으면 빈 배열
 */
export function extractPictureTags(message: string): ImageData[] {
  const matches = message.matchAll(PICTURE_TAG_REGEX);
  const images: ImageData[] = [];

  for (const match of matches) {
    const url = match[1].trim();
    if (url) {
      images.push({ url });
    }
  }

  return images;
}

/**
 * 메시지에서 picture tag를 제거
 * @param message 메시지 내용
 * @returns picture tag가 제거된 메시지
 */
export function removePictureTags(message: string): string {
  return message.replace(PICTURE_TAG_REGEX, '').trim();
}

/**
 * 메시지에 picture tag가 있는지 확인
 * @param message 메시지 내용
 * @returns picture tag가 있으면 true
 */
export function hasPictureTag(message: string): boolean {
  return PICTURE_TAG_REGEX.test(message);
}
