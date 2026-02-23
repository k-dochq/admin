'use client';

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { computeAutoResponseInfo } from '@/lib/consultation/compute-auto-response-info';

const LANGUAGE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  th: 'ไทย',
  'zh-Hant': '繁體中文',
  ja: '日本語',
  hi: 'हिन्दी',
  ar: 'العربية',
  ru: 'Русский',
  tl: 'Tagalog',
};

interface AutoResponseInfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutoResponseInfoPanel({
  open,
  onOpenChange,
}: AutoResponseInfoPanelProps) {
  const info = useMemo(() => (open ? computeAutoResponseInfo() : null), [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>자동응답·공휴일 안내</SheetTitle>
          <SheetDescription>
            현재 시점 기준 영업시간·공휴일 상태와 언어별 자동응답 메시지를 확인할 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        {info && (
          <div className='mt-6 flex flex-col gap-4'>
            {/* 현재 상태 */}
            <div>
              <h3 className='mb-2 text-sm font-medium'>현재 상태</h3>
              {info.isBusinessHours ? (
                <Badge variant='default' className='bg-green-600'>
                  영업시간
                </Badge>
              ) : info.isPublicHoliday ? (
                <Badge variant='secondary'>공휴일</Badge>
              ) : (
                <Badge variant='outline'>영업시간 외</Badge>
              )}
            </div>

            {/* 공휴일인 경우: 다음 영업일 */}
            {info.isPublicHoliday && info.nextBusinessDay && (
              <div>
                <h3 className='mb-2 text-sm font-medium'>다음 영업일</h3>
                <p className='text-muted-foreground text-sm'>
                  {info.nextBusinessDayFormattedByLocale['ko'] ?? info.nextBusinessDay.toISOString().slice(0, 10)}
                </p>
              </div>
            )}

            {/* 한국 공휴일 목록 (연도별) */}
            <div>
              <h3 className='mb-2 text-sm font-medium'>한국 공휴일 목록</h3>
              <div className='max-h-40 overflow-y-auto rounded-md border bg-muted/30 p-2 text-xs'>
                {(() => {
                  const byYear: Record<string, string[]> = {};
                  for (const d of info.holidayList) {
                    const y = d.slice(0, 4);
                    if (!byYear[y]) byYear[y] = [];
                    byYear[y].push(d);
                  }
                  return (
                    <div className='flex flex-col gap-2'>
                      {Object.keys(byYear)
                        .sort()
                        .map((year) => (
                          <div key={year}>
                            <span className='font-medium'>{year}년</span>
                            <span className='text-muted-foreground ml-2'>
                              {byYear[year].join(', ')}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 일과시간 외 자동응답 메시지 */}
            <div>
              <h3 className='mb-2 text-sm font-medium'>일과시간 외 자동응답 메시지</h3>
              <p className='text-muted-foreground mb-2 text-xs'>
                평일 저녁·주말(공휴일 제외)에 상담 메시지가 오면 이 메시지가 전송됩니다.
              </p>
              <Tabs defaultValue={info.supportedLanguages[0]} className='w-full'>
                <TabsList className='flex h-auto flex-wrap gap-1'>
                  {info.supportedLanguages.map((lang) => (
                    <TabsTrigger key={`off-${lang}`} value={lang} className='text-xs'>
                      {LANGUAGE_LABELS[lang] ?? lang}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {info.supportedLanguages.map((lang) => (
                  <TabsContent key={`off-${lang}`} value={lang} className='mt-2'>
                    <div className='rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap'>
                      {info.offHoursMessagesByLanguage[lang]}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* 공휴일 자동응답 메시지 */}
            <div>
              <h3 className='mb-2 text-sm font-medium'>공휴일 자동응답 메시지</h3>
              <p className='text-muted-foreground mb-2 text-xs'>
                한국 공휴일에 상담 메시지가 오면 이 메시지가 전송됩니다. 재개일은 실제/예시 날짜로 치환되어 표시됩니다.
              </p>
              <Tabs defaultValue={info.supportedLanguages[0]} className='w-full'>
                <TabsList className='flex h-auto flex-wrap gap-1'>
                  {info.supportedLanguages.map((lang) => (
                    <TabsTrigger key={`holiday-${lang}`} value={lang} className='text-xs'>
                      {LANGUAGE_LABELS[lang] ?? lang}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {info.supportedLanguages.map((lang) => (
                  <TabsContent key={`holiday-${lang}`} value={lang} className='mt-2'>
                    <div className='rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap'>
                      {info.holidayMessagesByLanguage[lang]}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
