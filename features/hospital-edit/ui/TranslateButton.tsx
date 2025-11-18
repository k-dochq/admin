'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranslateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isTranslating?: boolean;
}

export function TranslateButton({
  onClick,
  disabled = false,
  isTranslating = false,
}: TranslateButtonProps) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={onClick}
      disabled={disabled || isTranslating}
      className='h-7 px-2 text-xs hover:bg-transparent'
    >
      {isTranslating ? (
        <>
          <Loader2 className='mr-1 h-3 w-3 animate-spin' />
          번역 중...
        </>
      ) : (
        '번역'
      )}
    </Button>
  );
}
