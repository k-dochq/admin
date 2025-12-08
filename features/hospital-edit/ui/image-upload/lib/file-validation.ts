export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // 파일 존재 체크
  if (!file) {
    return { isValid: false, error: '파일이 없습니다.' };
  }

  // 파일 이름 체크
  if (!file.name) {
    return { isValid: false, error: '파일 이름이 없습니다.' };
  }

  // 파일 크기 체크 (0바이트)
  if (file.size === 0) {
    return { isValid: false, error: '파일 크기가 0입니다.' };
  }

  // 이미지 파일 체크
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: '이미지 파일만 업로드할 수 있습니다.' };
  }

  // 파일 크기 체크 (500KB)
  const maxSize = 500 * 1024; // 500KB
  if (file.size > maxSize) {
    return { isValid: false, error: '파일 크기가 500KB를 초과합니다.' };
  }

  return { isValid: true };
}
