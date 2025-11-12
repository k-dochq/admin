'use client';

import { forwardRef } from 'react';

interface ImageUploadInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const ImageUploadInput = forwardRef<HTMLInputElement, ImageUploadInputProps>(
  ({ onChange, disabled = false }, ref) => {
    return (
      <input
        ref={ref}
        type='file'
        accept='image/*'
        onChange={onChange}
        className='hidden'
        disabled={disabled}
        // capture 속성을 명시하지 않아 카메라 촬영 대신 갤러리/파일 선택만 가능하도록 설정
      />
    );
  },
);

ImageUploadInput.displayName = 'ImageUploadInput';
