'use client';

import { SendIcon } from '@/shared/ui/icons/SendIcon';

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  hasMessage: boolean;
}

export function SendButton({ onClick, disabled = false, hasMessage }: SendButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='relative ml-2 flex size-[30px] shrink-0 items-center justify-center'
    >
      <SendIcon className={hasMessage ? 'opacity-100' : 'opacity-50'} />
    </button>
  );
}
