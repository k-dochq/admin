'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { sortHospitalsByName } from 'shared/lib';

type HospitalLike = {
  id: string;
  name: Prisma.JsonValue;
};

function getHospitalLabel(name: Prisma.JsonValue): string {
  if (!name) return '이름 없음';
  if (typeof name === 'string') return name;
  if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
    const obj = name as Record<string, unknown>;
    return (
      (obj.ko_KR as string) ||
      (obj.en_US as string) ||
      (obj.th_TH as string) ||
      (obj.zh_TW as string) ||
      (obj.ja_JP as string) ||
      (obj.hi_IN as string) ||
      '이름 없음'
    );
  }
  return '이름 없음';
}

function getHospitalSearchText(name: Prisma.JsonValue): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
    const obj = name as Record<string, unknown>;
    return Object.values(obj)
      .filter((v): v is string => typeof v === 'string')
      .join(' ');
  }
  return '';
}

interface HospitalComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  hospitals: HospitalLike[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;

  includeAllOption?: boolean;
  allValue?: string;
  allLabel?: string;

  className?: string;
}

export function HospitalCombobox({
  value,
  onValueChange,
  hospitals,
  placeholder = '병원 선택',
  searchPlaceholder = '병원명 검색...',
  disabled = false,
  includeAllOption = false,
  allValue = 'all',
  allLabel = '전체 병원',
  className,
}: HospitalComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    const sorted = sortHospitalsByName(hospitals);
    const mapped = sorted.map((h) => {
      const label = getHospitalLabel(h.name);
      const searchText = `${label} ${getHospitalSearchText(h.name)}`.toLowerCase();
      return { id: h.id, label, searchText };
    });
    if (includeAllOption) {
      return [{ id: allValue, label: allLabel, searchText: allLabel.toLowerCase() }, ...mapped];
    }
    return mapped;
  }, [hospitals, includeAllOption, allLabel, allValue]);

  const selectedLabel = useMemo(() => {
    if (!value) return '';
    const found = options.find((o) => o.id === value);
    return found?.label || '';
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.searchText.includes(q));
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={(next) => (!disabled ? setOpen(next) : undefined)}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className={cn('truncate text-left', !selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-2' align='start'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className='pl-9'
            autoFocus
          />
        </div>

        <div className='mt-2 max-h-64 overflow-y-auto rounded-md border'>
          {filtered.length === 0 ? (
            <div className='text-muted-foreground px-3 py-2 text-sm'>검색 결과가 없습니다.</div>
          ) : (
            filtered.map((o) => {
              const isSelected = o.id === value;
              return (
                <button
                  key={o.id}
                  type='button'
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                    isSelected && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => {
                    onValueChange(o.id);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className='w-4 shrink-0'>
                    {isSelected ? <Check className='h-4 w-4' /> : null}
                  </span>
                  <span className='truncate'>{o.label}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

