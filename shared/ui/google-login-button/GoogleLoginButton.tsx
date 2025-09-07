'use client';

import { Button } from '@/components/ui/button';
import { GoogleIcon } from './GoogleIcon';
import { cn } from '@/lib/utils';

interface GoogleLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GoogleLoginButton({
  onClick,
  disabled = false,
  className,
  children = 'Google로 로그인',
}: GoogleLoginButtonProps) {
  return (
    <Button
      variant='outline'
      size='lg'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-3 text-base font-medium',
        'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
        'transition-colors duration-200',
        className,
      )}
    >
      <GoogleIcon className='h-5 w-5' />
      {children}
    </Button>
  );
}
