'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatFileUpload } from '../model/useChatFileUpload';
import { isImageType } from '@/shared/config/file-types';
import { toast } from 'sonner';
import { CameraButton } from './CameraButton';
import { SendButton } from './SendButton';
import { ChatTextArea } from './ChatTextArea';
import { FileUploadInput } from './FileUploadInput';

interface AdminChatInputProps {
  onSendMessage: (content: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  userId: string;
}

export function AdminChatInput({
  onSendMessage,
  onSendTyping: _onSendTyping,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
  userId,
}: AdminChatInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, uploadError, uploadFile, clearError } = useChatFileUpload(userId);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // 모바일 디바이스 감지: 터치 포인터가 있는 경우
    const isMobileDevice =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    // 모바일에서는 Enter 키로 줄바꿈만 허용 (전송하지 않음)
    if (isMobileDevice) {
      return; // Enter 키를 눌러도 기본 동작(줄바꿈) 허용
    }

    // 데스크톱에서는 Enter로 전송, Shift+Enter로 줄바꿈
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 업로드 실행
    const result = await uploadFile(file);

    if (result) {
      // 파일 타입에 따라 다른 태그로 메시지 전송
      if (isImageType(result.mimeType)) {
        // 이미지는 기존처럼 <picture> 태그 사용
        const pictureMessage = `<picture>${result.url}</picture>`;
        onSendMessage(pictureMessage);
      } else {
        // 문서 파일은 <file> 태그 사용 (메타데이터 포함)
        const fileMessage = `<file url="${result.url}" name="${result.fileName}" size="${result.fileSize}" type="${result.mimeType}"></file>`;
        onSendMessage(fileMessage);
      }
    }

    // input 초기화
    e.target.value = '';
  };

  // 에러 토스트 표시
  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError);
      clearError();
    }
  }, [uploadError, clearError]);

  return (
    <div className='relative box-border flex content-stretch items-end justify-between bg-white px-5 pt-4 pb-8'>
      <div className='pointer-events-none absolute inset-0 border-[1px_0px_0px] border-solid border-neutral-200 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.24)]' />

      <div className='flex w-full items-end justify-between gap-2'>
        <CameraButton onClick={handleCameraClick} disabled={disabled} isUploading={isUploading} />

        <FileUploadInput
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        <ChatTextArea
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isUploading}
        />

        <SendButton
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          hasMessage={!!message.trim()}
        />
      </div>
    </div>
  );
}
