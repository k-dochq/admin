'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = React.useState<string>('09');
  const [selectedMinute, setSelectedMinute] = React.useState<string>('00');

  // value가 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        setSelectedDate(date);
        setSelectedHour(date.getHours().toString().padStart(2, '0'));
        setSelectedMinute(date.getMinutes().toString().padStart(2, '0'));
      } catch {
        // 잘못된 날짜 형식인 경우 무시
      }
    } else {
      setSelectedDate(undefined);
      setSelectedHour('09');
      setSelectedMinute('00');
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateDateTime(date, selectedHour, selectedMinute);
    }
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (selectedDate) {
      updateDateTime(selectedDate, hour, minute);
    }
  };

  const updateDateTime = (date: Date, hour: string, minute: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour, 10));
    newDate.setMinutes(parseInt(minute, 10));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    onChange(newDate.toISOString());
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setSelectedHour('09');
    setSelectedMinute('00');
    onChange('');
  };

  const displayValue = selectedDate
    ? `${format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })} ${selectedHour}:${selectedMinute}`
    : '';

  // 시간 옵션 생성
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {displayValue || placeholder || '날짜와 시간을 선택하세요'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='p-3'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              locale={ko}
            />

            {/* 시간 선택 */}
            <div className='mt-3 border-t pt-3'>
              <div className='mb-3 flex items-center space-x-2'>
                <Clock className='text-muted-foreground h-4 w-4' />
                <span className='text-sm font-medium'>시간 선택</span>
              </div>

              <div className='flex items-center space-x-2'>
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
                    {minutes
                      .filter((_, i) => i % 5 === 0)
                      .map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className='mt-3 flex justify-between border-t pt-3'>
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
