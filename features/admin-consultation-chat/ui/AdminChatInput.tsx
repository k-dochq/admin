'use client';

import { useState } from 'react';
import { SendIcon } from '@/shared/ui/icons/SendIcon';

interface AdminChatInputProps {
  onSendMessage: (content: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AdminChatInput({
  onSendMessage,
  onSendTyping: _onSendTyping,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: AdminChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='relative box-border flex content-stretch items-center justify-between bg-white px-5 pt-4 pb-8'>
      <div className='pointer-events-none absolute inset-0 border-[1px_0px_0px] border-solid border-neutral-200 shadow-[0px_8px_16px_0px_rgba(0,0,0,0.24)]' />

      <div className='flex w-full items-center justify-between'>
        <div className='relative flex-1 shrink-0'>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full border-none bg-transparent font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>

        <button
          type='button'
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className='relative ml-4 flex size-[30px] shrink-0 items-center justify-center'
        >
          <SendIcon className={message.trim() ? 'opacity-100' : 'opacity-50'} />
        </button>
      </div>
    </div>
  );
}
