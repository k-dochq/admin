'use client';

interface LoadOlderButtonProps {
  hasMore?: boolean;
  onClick?: () => void | Promise<void>;
}

export function LoadOlderButton({ hasMore, onClick }: LoadOlderButtonProps) {
  if (!hasMore) return null;
  return (
    <div className='flex w-full justify-center p-2'>
      <button
        type='button'
        className='text-muted-foreground text-sm underline underline-offset-4'
        onClick={onClick}
      >
        이전 메시지 불러오기
      </button>
    </div>
  );
}
