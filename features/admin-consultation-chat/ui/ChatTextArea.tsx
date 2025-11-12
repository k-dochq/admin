'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface ChatTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface ChatTextAreaRef {
  focus: () => void;
  blur: () => void;
}

export const ChatTextArea = forwardRef<ChatTextAreaRef, ChatTextAreaProps>(
  ({ value, onChange, onKeyPress, placeholder, disabled = false }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 자동 높이 조절
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 28; // 카메라 버튼 높이와 동일
        const maxHeight = 120; // 최대 높이 (약 6줄)
        const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
        textarea.style.height = `${newHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    // 초기 마운트 시에도 높이 조절
    useEffect(() => {
      adjustHeight();
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
    }));

    return (
      <div className='relative flex min-h-[28px] flex-1 shrink-0 items-center'>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex w-full resize-none overflow-hidden border-none bg-transparent font-['Pretendard:Medium',_sans-serif] text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
          style={{
            minHeight: '28px',
            maxHeight: '120px',
            lineHeight: '28px',
            paddingTop: '0',
            paddingBottom: '0',
          }}
        />
      </div>
    );
  },
);

ChatTextArea.displayName = 'ChatTextArea';
