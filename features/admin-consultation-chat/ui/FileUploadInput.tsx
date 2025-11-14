'use client';

import { forwardRef } from 'react';
import { getAcceptString } from '@/shared/config/file-types';

interface FileUploadInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  ({ onChange, disabled = false }, ref) => {
    return (
      <input
        ref={ref}
        type='file'
        accept={getAcceptString()}
        onChange={onChange}
        className='hidden'
        disabled={disabled}
        // capture 속성을 명시하지 않아 카메라 촬영 대신 갤러리/파일 선택만 가능하도록 설정
      />
    );
  },
);

FileUploadInput.displayName = 'FileUploadInput';
