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
      variant='outline'
      size='sm'
      onClick={onClick}
      disabled={disabled || isTranslating}
      className='shrink-0'
    >
      {isTranslating ? (
        <>
          <Loader2 className='mr-2 h-3 w-3 animate-spin' />
          번역 중...
        </>
      ) : (
        '번역'
      )}
    </Button>
  );
}
