'use client';

interface AdminMessageHeaderProps {
  showHeader?: boolean;
}

export function AdminMessageHeader({ showHeader = true }: AdminMessageHeaderProps) {
  if (!showHeader) return null;

  return (
    <div className='flex items-center gap-2'>
      <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
        관리자
      </span>
    </div>
  );
}
