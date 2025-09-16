'use client';

interface MessageTimeProps {
  time: string;
}

export function MessageTime({ time }: MessageTimeProps) {
  return (
    <div className="relative shrink-0 font-['Pretendard:Regular',_sans-serif] text-[12px] leading-[0] text-nowrap text-neutral-500 not-italic">
      <p className='leading-[16px] whitespace-pre'>{time}</p>
    </div>
  );
}
