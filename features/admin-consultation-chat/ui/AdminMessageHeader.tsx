'use client';

interface AdminMessageHeaderProps {
  showHeader?: boolean;
  adminName?: string;
}

export function AdminMessageHeader({ showHeader = true, adminName }: AdminMessageHeaderProps) {
  if (!showHeader) return null;

  return (
    <div className='flex items-center gap-2'>
      <span className="font-['Pretendard:Medium',_sans-serif] text-[14px] leading-[20px] text-neutral-900">
        {adminName ? `관리자 (${adminName})` : '관리자'}
      </span>
    </div>
  );
}
