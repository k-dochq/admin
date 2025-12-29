'use client';

import { type ReactNode } from 'react';

interface MessageBubbleProps {
  children: ReactNode;
  variant: 'user' | 'hospital';
  className?: string;
}

export function MessageBubble({ children, variant, className = '' }: MessageBubbleProps) {
  const baseClasses =
    'box-border content-stretch flex flex-col gap-3 items-start justify-start px-3 py-2 relative rounded-[12px] shrink-0 max-w-[80%] min-w-0 break-words';

  const variantClasses = {
    user: 'bg-gradient-to-b from-[#ae33fb] from-[37.132%] to-[#6544fa] to-[291.18%] via-[#da47ef] via-[162.93%]',
    hospital: 'bg-neutral-100',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</div>;
}
