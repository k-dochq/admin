'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerEnhancedProps {
  label: string;
  value?: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TimePickerEnhanced({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: TimePickerEnhancedProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, setSelectedHour] = React.useState<string>('09');
  const [selectedMinute, setSelectedMinute] = React.useState<string>('00');

  // value가 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    if (value) {
      try {
        // HH:mm 형식 또는 ISO 문자열 처리
        let timeString = value;
        if (value.includes('T') || value.includes('Z')) {
          // ISO 문자열인 경우 시간 부분만 추출
          const date = new Date(value);
          timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }

        const [hour, minute] = timeString.split(':');
        if (hour && minute) {
          setSelectedHour(hour.padStart(2, '0'));
          setSelectedMinute(minute.padStart(2, '0'));
        }
      } catch {
        // 잘못된 시간 형식인 경우 기본값 사용
        setSelectedHour('09');
        setSelectedMinute('00');
      }
    } else {
      setSelectedHour('09');
      setSelectedMinute('00');
    }
  }, [value]);

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    // HH:mm 형식으로 반환
    onChange(`${hour}:${minute}`);
  };

  const handleClear = () => {
    setSelectedHour('09');
    setSelectedMinute('00');
    onChange('');
  };

  const displayValue = value ? `${selectedHour}:${selectedMinute}` : '';

  // 시간 옵션 생성
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 5분 단위

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <Clock className='mr-2 h-4 w-4' />
            {displayValue || placeholder || '시간을 선택하세요'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='p-4'>
            <div className='mb-4 flex items-center space-x-2'>
              <Clock className='text-muted-foreground h-4 w-4' />
              <span className='text-sm font-medium'>시간 선택</span>
            </div>

            <div className='mb-4 flex items-center space-x-2'>
              <Select
                value={selectedHour}
                onValueChange={(hour) => handleTimeChange(hour, selectedMinute)}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className='text-muted-foreground'>:</span>

              <Select
                value={selectedMinute}
                onValueChange={(minute) => handleTimeChange(selectedHour, minute)}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 빠른 선택 버튼 */}
            <div className='mb-4 space-y-2'>
              <div className='text-muted-foreground text-xs'>빠른 선택</div>
              <div className='grid grid-cols-2 gap-2'>
                <Button variant='outline' size='sm' onClick={() => handleTimeChange('10', '00')}>
                  10:00
                </Button>
                <Button variant='outline' size='sm' onClick={() => handleTimeChange('19', '00')}>
                  19:00
                </Button>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className='flex justify-between border-t pt-3'>
              <Button variant='outline' size='sm' onClick={handleClear}>
                초기화
              </Button>
              <Button size='sm' onClick={() => setOpen(false)}>
                확인
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
