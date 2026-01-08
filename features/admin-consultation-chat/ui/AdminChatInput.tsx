'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useChatFileUpload } from '../model/useChatFileUpload';
import { useTranslation } from '../model/useTranslation';
import { isImageType } from '@/shared/config/file-types';
import { toast } from 'sonner';
import { CameraButton } from './CameraButton';
import { SendButton } from './SendButton';
import { ChatTextArea } from './ChatTextArea';
import { FileUploadInput } from './FileUploadInput';
import { TranslateButton } from './TranslateButton';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

// Editor를 동적으로 import하여 SSR 문제 방지
const Editor = dynamic(
  () => import('@/components/ui/editor').then((mod) => ({ default: mod.Editor })),
  {
    ssr: false,
    loading: () => (
      <div className='flex min-h-[200px] items-center justify-center rounded-lg border'>
        <div className='text-muted-foreground text-sm'>에디터를 로딩 중...</div>
      </div>
    ),
  },
);

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
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, uploadError, uploadFile, clearError } = useChatFileUpload(userId);
  const { translate, isTranslating } = useTranslation();

  const handleSend = () => {
    if (isEditorMode) {
      // 에디터 모드일 때 HTML 내용을 <editor> 태그로 감싸서 전송
      if (editorContent.trim() && !disabled) {
        const wrappedContent = `<editor>${editorContent}</editor>`;
        onSendMessage(wrappedContent);
        setEditorContent('');
        setIsEditorMode(false);
      }
    } else {
      // 일반 모드일 때 텍스트 전송
      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  };

  const handleToggleEditorMode = () => {
    setIsEditorMode((prev) => !prev);
    if (!isEditorMode) {
      // 에디터 모드로 전환 시 현재 텍스트를 에디터에 복사
      setEditorContent(message ? `<p>${message}</p>` : '');
    } else {
      // 일반 모드로 전환 시 에디터 내용을 텍스트로 변환 (HTML 태그 제거)
      const textContent = editorContent.replace(/<[^>]*>/g, '').trim();
      setMessage(textContent);
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

  // 번역 핸들러
  const handleTranslate = async (targetLang: 'en' | 'th') => {
    if (!message.trim()) {
      toast.error('번역할 텍스트를 입력해주세요.');
      return;
    }

    try {
      const translatedText = await translate({
        text: message,
        sourceLang: 'ko',
        targetLang,
      });
      setMessage(translatedText);
    } catch (error) {
      // 에러는 useTranslation의 onError에서 이미 toast로 표시됨
      // 여기서는 추가 처리 없음
    }
  };

  // 에러 토스트 표시
  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError);
      clearError();
    }
  }, [uploadError, clearError]);

  // 에디터 모드일 때 입력창 위치에서 위로 확장
  if (isEditorMode) {
    return (
      <div className='relative box-border flex min-w-0 flex-col bg-white'>
        <div className='pointer-events-none absolute inset-0 border-[1px_0px_0px] border-solid border-neutral-200 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.24)]' />

        {/* 헤더 */}
        <div className='flex items-center justify-between border-b px-3 py-2 sm:px-4 sm:py-3'>
          <div className='flex items-center gap-2'>
            <FileText className='h-4 w-4 text-gray-600 sm:h-5 sm:w-5' />
            <h2 className='text-sm font-semibold sm:text-base'>에디터 모드</h2>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleToggleEditorMode}
            className='flex h-8 w-8 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-2'
            title='닫기'
          >
            <X className='h-4 w-4' />
            <span className='hidden sm:inline'>닫기</span>
          </Button>
        </div>

        {/* 에디터 영역 */}
        <div className='max-h-[60vh] min-h-[400px] overflow-auto p-4'>
          <Editor content={editorContent} onChange={setEditorContent} placeholder={placeholder} />
        </div>

        {/* 하단 버튼 영역 */}
        <div className='border-t bg-white px-3 py-3 sm:px-4'>
          <div className='flex items-center justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={handleToggleEditorMode}>
              취소
            </Button>
            <SendButton
              onClick={handleSend}
              disabled={!editorContent.trim() || disabled || isUploading || isTranslating}
              hasMessage={!!editorContent.trim()}
            />
          </div>
        </div>
      </div>
    );
  }

  // 일반 모드
  return (
    <div className='relative box-border flex min-w-0 content-stretch items-end justify-between bg-white px-3 pt-3 pb-6 sm:px-5 sm:pt-4 sm:pb-8'>
      <div className='pointer-events-none absolute inset-0 border-[1px_0px_0px] border-solid border-neutral-200 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.24)]' />

      <div className='flex w-full min-w-0 items-end justify-between gap-1.5 sm:gap-2'>
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
          disabled={disabled || isUploading || isTranslating}
        />

        <div className='flex items-center gap-0.5 sm:gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleToggleEditorMode}
            className='flex h-8 w-8 items-center justify-center p-0'
            title='에디터 모드'
            disabled={disabled || isUploading || isTranslating}
          >
            <FileText className='h-4 w-4' />
          </Button>
          <TranslateButton
            onClick={() => handleTranslate('en')}
            disabled={!message.trim() || disabled || isUploading || isTranslating}
            isTranslating={isTranslating}
            targetLang='en'
            targetLangLabel='영어'
          />
          <TranslateButton
            onClick={() => handleTranslate('th')}
            disabled={!message.trim() || disabled || isUploading || isTranslating}
            isTranslating={isTranslating}
            targetLang='th'
            targetLangLabel='태국어'
          />
        </div>

        <SendButton
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading || isTranslating}
          hasMessage={!!message.trim()}
        />
      </div>
    </div>
  );
}
