'use client';

import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AdminChatInputProps {
  onSendMessage: (content: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AdminChatInput({
  onSendMessage,
  onSendTyping,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: AdminChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 타이핑 상태 관리
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onSendTyping(true);
    }

    // 기존 타이머 제거
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3초 후 타이핑 상태 해제
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onSendTyping(false);
    }, 3000);
  }, [isTyping, onSendTyping]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    onSendTyping(false);
  }, [onSendTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    handleTypingStop();

    // 포커스 유지
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex-1'>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className='min-h-[40px] resize-none'
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size='sm'
        className='px-3'
      >
        <Send className='h-4 w-4' />
      </Button>
    </div>
  );
}
