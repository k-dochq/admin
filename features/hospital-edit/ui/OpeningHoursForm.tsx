'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TimePicker } from '@/components/ui/time-picker';
import { type OpeningHoursInfo, type DaySchedule } from '../api/entities/types';

interface OpeningHoursFormProps {
  value: OpeningHoursInfo;
  onChange: (value: OpeningHoursInfo) => void;
}

const DAYS = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
  { key: 'saturday', label: '토요일' },
  { key: 'sunday', label: '일요일' },
] as const;

export function OpeningHoursForm({ value, onChange }: OpeningHoursFormProps) {
  const updateDay = (dayKey: keyof OpeningHoursInfo, dayData: DaySchedule) => {
    if (dayKey === 'launchTime') return; // launchTime은 별도 처리

    onChange({
      ...value,
      [dayKey]: dayData,
    });
  };

  const updateLaunchTime = (field: 'openTime' | 'closeTime', time: string) => {
    onChange({
      ...value,
      launchTime: {
        ...value.launchTime,
        [field]: time,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>상세 진료시간</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 요일별 진료시간 */}
        <div className='space-y-4'>
          {DAYS.map(({ key, label }) => {
            const daySchedule = value[key] || {};
            const isHoliday = daySchedule.holiday || false;

            return (
              <div
                key={key}
                className='grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-4'
              >
                <div className='flex items-center space-x-2'>
                  <Label className='font-medium'>{label}</Label>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    checked={!isHoliday}
                    onCheckedChange={(checked) =>
                      updateDay(key, {
                        ...daySchedule,
                        holiday: !checked,
                        ...(checked ? {} : { openTime: undefined, closeTime: undefined }),
                      })
                    }
                  />
                  <Label className='text-muted-foreground text-sm'>
                    {isHoliday ? '휴무' : '영업'}
                  </Label>
                </div>

                {!isHoliday && (
                  <>
                    <TimePicker
                      label='시작시간'
                      value={daySchedule.openTime}
                      onChange={(time) =>
                        updateDay(key, {
                          ...daySchedule,
                          openTime: time,
                        })
                      }
                    />
                    <TimePicker
                      label='종료시간'
                      value={daySchedule.closeTime}
                      onChange={(time) =>
                        updateDay(key, {
                          ...daySchedule,
                          closeTime: time,
                        })
                      }
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 점심시간 */}
        <div className='rounded-lg border p-4'>
          <Label className='mb-4 block text-base font-medium'>점심시간</Label>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <TimePicker
              label='점심시간 시작'
              value={value.launchTime?.openTime}
              onChange={(time) => updateLaunchTime('openTime', time)}
            />
            <TimePicker
              label='점심시간 종료'
              value={value.launchTime?.closeTime}
              onChange={(time) => updateLaunchTime('closeTime', time)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
