'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { type LocalizedText, type NoticeFormErrors } from '../model/useNoticeForm';

// Editor를 동적으로 import하여 SSR 문제 방지
const Editor = dynamic(
  () => import('@/components/ui/editor').then((mod) => ({ default: mod.Editor })),
  {
    ssr: false,
    loading: () => (
      <div className='flex min-h-[200px] items-center justify-center rounded-lg border'>
        <div className='text-muted-foreground text-sm'>에디터를 로딩 중...</div>
      </div>
    ),
  },
);

interface NoticeContentSectionProps {
  content: LocalizedText;
  errors: NoticeFormErrors;
  onUpdateContent: (field: 'ko_KR' | 'en_US' | 'th_TH', value: string) => void;
}

export function NoticeContentSection({
  content,
  errors,
  onUpdateContent,
}: NoticeContentSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>내용</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='ko_KR' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='ko_KR'>한국어</TabsTrigger>
            <TabsTrigger value='en_US'>English</TabsTrigger>
            <TabsTrigger value='th_TH'>ไทย</TabsTrigger>
          </TabsList>

          <TabsContent value='ko_KR' className='space-y-2'>
            <Editor
              key={`ko_KR-${content.ko_KR}`} // content 변경 시 Editor 재렌더링 강제
              content={content.ko_KR}
              onChange={(value) => onUpdateContent('ko_KR', value)}
              placeholder='한국어 내용을 입력하세요...'
              className={errors.content?.ko_KR ? 'border-destructive' : ''}
            />
            {errors.content?.ko_KR && (
              <p className='text-destructive text-sm'>{errors.content.ko_KR}</p>
            )}
          </TabsContent>

          <TabsContent value='en_US' className='space-y-2'>
            <Editor
              key={`en_US-${content.en_US}`} // content 변경 시 Editor 재렌더링 강제
              content={content.en_US}
              onChange={(value) => onUpdateContent('en_US', value)}
              placeholder='Enter English content...'
              className={errors.content?.en_US ? 'border-destructive' : ''}
            />
            {errors.content?.en_US && (
              <p className='text-destructive text-sm'>{errors.content.en_US}</p>
            )}
          </TabsContent>

          <TabsContent value='th_TH' className='space-y-2'>
            <Editor
              key={`th_TH-${content.th_TH}`} // content 변경 시 Editor 재렌더링 강제
              content={content.th_TH}
              onChange={(value) => onUpdateContent('th_TH', value)}
              placeholder='กรอกเนื้อหาภาษาไทย...'
              className={errors.content?.th_TH ? 'border-destructive' : ''}
            />
            {errors.content?.th_TH && (
              <p className='text-destructive text-sm'>{errors.content.th_TH}</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
