'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type LocalizedText, type NoticeFormErrors } from '../model/useNoticeForm';

interface NoticeTitleSectionProps {
  title: LocalizedText;
  errors: NoticeFormErrors;
  onUpdateTitle: (field: 'ko_KR' | 'en_US' | 'th_TH', value: string) => void;
}

export function NoticeTitleSection({ title, errors, onUpdateTitle }: NoticeTitleSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='ko_KR' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='ko_KR'>한국어</TabsTrigger>
            <TabsTrigger value='en_US'>English</TabsTrigger>
            <TabsTrigger value='th_TH'>ไทย</TabsTrigger>
          </TabsList>

          <TabsContent value='ko_KR' className='space-y-2'>
            <Label htmlFor='title-ko'>한국어 제목</Label>
            <Input
              id='title-ko'
              value={title.ko_KR}
              onChange={(e) => onUpdateTitle('ko_KR', e.target.value)}
              placeholder='한국어 제목을 입력하세요'
              className={errors.title?.ko_KR ? 'border-destructive' : ''}
            />
            {errors.title?.ko_KR && (
              <p className='text-destructive text-sm'>{errors.title.ko_KR}</p>
            )}
          </TabsContent>

          <TabsContent value='en_US' className='space-y-2'>
            <Label htmlFor='title-en'>English Title</Label>
            <Input
              id='title-en'
              value={title.en_US}
              onChange={(e) => onUpdateTitle('en_US', e.target.value)}
              placeholder='Enter English title'
              className={errors.title?.en_US ? 'border-destructive' : ''}
            />
            {errors.title?.en_US && (
              <p className='text-destructive text-sm'>{errors.title.en_US}</p>
            )}
          </TabsContent>

          <TabsContent value='th_TH' className='space-y-2'>
            <Label htmlFor='title-th'>Thai Title</Label>
            <Input
              id='title-th'
              value={title.th_TH}
              onChange={(e) => onUpdateTitle('th_TH', e.target.value)}
              placeholder='กรอกหัวข้อภาษาไทย'
              className={errors.title?.th_TH ? 'border-destructive' : ''}
            />
            {errors.title?.th_TH && (
              <p className='text-destructive text-sm'>{errors.title.th_TH}</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
