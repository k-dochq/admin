'use client';

import * as React from 'react';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  locale: 'ko' | 'en' | 'th';
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  className?: string;
  required?: boolean;
  label?: string;
  error?: string;
  yearRange?: { from: number; to: number };
}

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
  </svg>
);

export function DatePicker({
  value,
  onChange,
  locale,
  placeholder,
  disabled,
  className = '',
  required = false,
  label,
  error,
  yearRange,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 외부 클릭 시 달력 닫기
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (locale === 'ko') {
      return `${year}년 ${month}월 ${day}일`;
    } else if (locale === 'th') {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  };

  const getPlaceholderText = (): string => {
    if (placeholder) return placeholder;

    if (locale === 'ko') return '날짜를 선택해주세요';
    if (locale === 'th') return 'เลือกวันที่';
    return 'Select date';
  };

  const handleDateSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const handleButtonClick = () => {
    setOpen(!open);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className='flex w-full flex-col gap-2'>
        {label && (
          <label className='text-sm leading-5 font-medium text-neutral-900'>
            <span>
              {required && <span style={{ color: '#AE33FB' }}>[필수]</span>}
              {!required && <span className='text-neutral-500'>[선택]</span>} {label}
            </span>
          </label>
        )}

        <button
          type='button'
          onClick={handleButtonClick}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-4 text-left text-sm font-normal',
            'focus:border-transparent focus:ring-2 focus:ring-[#DA47EF] focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-300 focus:ring-red-500',
          )}
        >
          <span className={value ? 'text-neutral-900' : 'text-neutral-500'}>
            {value ? formatDate(value) : getPlaceholderText()}
          </span>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-4 w-4 text-neutral-400' />
            <ChevronDownIcon className='h-4 w-4 text-neutral-400' />
          </div>
        </button>

        {open && (
          <div className='absolute top-full left-0 z-50 mt-1'>
            <Calendar
              mode='single'
              selected={value}
              onSelect={handleDateSelect}
              locale={locale}
              disabled={disabled}
              captionLayout='dropdown'
              yearRange={yearRange}
            />
          </div>
        )}

        {error && <p className='text-sm leading-5 text-red-500'>{error}</p>}
      </div>
    </div>
  );
}
