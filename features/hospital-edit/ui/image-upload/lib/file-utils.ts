import { type FileWithPreview } from '../types';
import { validateFile } from './file-validation';

export function createFileWithPreview(file: File): FileWithPreview {
  const validation = validateFile(file);

  return Object.assign(file, {
    id: crypto.randomUUID(),
    preview: URL.createObjectURL(file),
    error: validation.isValid ? undefined : validation.error,
  }) as FileWithPreview;
}

export function revokeFilePreview(file: FileWithPreview): void {
  URL.revokeObjectURL(file.preview);
}
