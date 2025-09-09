'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TimePicker({ label, value, onChange, disabled }: TimePickerProps) {
  const formatTimeForInput = (timeString?: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toTimeString().slice(0, 5); // HH:MM 형식
    } catch {
      return '';
    }
  };

  const formatTimeForStorage = (timeInput: string) => {
    if (!timeInput) return '';
    const today = new Date().toISOString().split('T')[0];
    return `${today}T${timeInput}:00.000Z`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue) {
      onChange(formatTimeForStorage(timeValue));
    } else {
      onChange('');
    }
  };

  return (
    <div>
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        type='time'
        value={formatTimeForInput(value)}
        onChange={handleTimeChange}
        disabled={disabled}
      />
    </div>
  );
}
