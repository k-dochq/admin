'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageTabs, type HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';
import { useYoutubeVideoCategories } from '@/lib/queries/youtube-video-categories';
import { Prisma } from '@prisma/client';

interface YoutubeVideoFormProps {
  formData: {
    categoryId: string;
    title: {
      ko: string;
      en: string;
      th: string;
      zh: string;
      ja: string;
      hi: string;
      tl: string;
      ar: string;
    };
    description: {
      ko: string;
      en: string;
      th: string;
      zh: string;
      ja: string;
      hi: string;
      tl: string;
      ar: string;
    };
    videoUrl: {
      ko: string;
      en: string;
      th: string;
      zh: string;
      ja: string;
      hi: string;
      tl: string;
      ar: string;
    };
    order: string;
    isActive: boolean;
  };
  errors: {
    categoryId?: string;
    title?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
      hi?: string;
      tl?: string;
      ar?: string;
    };
    videoUrl?: {
      ko?: string;
      en?: string;
      th?: string;
      zh?: string;
      ja?: string;
      hi?: string;
      tl?: string;
      ar?: string;
    };
  };
  selectedLocale: HospitalLocale;
  onUpdateField: (field: string, value: unknown) => void;
  onUpdateNestedField: (
    field: 'title' | 'description' | 'videoUrl',
    locale: 'ko' | 'en' | 'th' | 'zh' | 'ja' | 'hi' | 'tl' | 'ar',
    value: string,
  ) => void;
  onLocaleChange: (locale: HospitalLocale) => void;
}

export function YoutubeVideoForm({
  formData,
  errors,
  selectedLocale,
  onUpdateField,
  onUpdateNestedField,
  onLocaleChange,
}: YoutubeVideoFormProps) {
  const { data: categoriesData } = useYoutubeVideoCategories();

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko as string) ||
        (textObj.en as string) ||
        (textObj.th as string) ||
        (textObj.zh as string) ||
        (textObj.ja as string) ||
        (textObj.hi as string) ||
        (textObj.tl as string) ||
        (textObj.ar as string) ||
        ''
      );
    }
    return '';
  };

  const localeMap: Record<HospitalLocale, 'ko' | 'en' | 'th' | 'zh' | 'ja' | 'hi' | 'tl' | 'ar'> = {
    ko_KR: 'ko',
    en_US: 'en',
    th_TH: 'th',
    zh_TW: 'zh',
    ja_JP: 'ja',
    hi_IN: 'hi',
    tl_PH: 'tl',
    ar_SA: 'ar',
  };

  const currentLocale = localeMap[selectedLocale];
  const categories = categoriesData?.categories || [];

  return (
    <div className='space-y-6'>
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='categoryId'>카테고리 *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => onUpdateField('categoryId', value)}
            >
              <SelectTrigger id='categoryId'>
                <SelectValue placeholder='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getLocalizedText(category.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className='text-destructive mt-1 text-sm'>{errors.categoryId}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='order'>정렬순서</Label>
            <Input
              id='order'
              type='number'
              value={formData.order}
              onChange={(e) => onUpdateField('order', e.target.value)}
              placeholder='숫자가 작을수록 앞에 표시됩니다'
            />
          </div>

          <div className='flex items-center justify-between'>
            <Label htmlFor='isActive'>활성화</Label>
            <Switch
              id='isActive'
              checked={formData.isActive}
              onCheckedChange={(checked) => onUpdateField('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 다국어 정보 */}
      <div className='space-y-6'>
        <LanguageTabs value={selectedLocale} onValueChange={onLocaleChange} />

        {/* 제목 */}
        <Card>
          <CardHeader>
            <CardTitle>제목 *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Input
                id={`title_${currentLocale}`}
                value={formData.title[currentLocale]}
                onChange={(e) => onUpdateNestedField('title', currentLocale, e.target.value)}
                placeholder={
                  selectedLocale === 'ko_KR'
                    ? '한국어 제목'
                    : selectedLocale === 'en_US'
                      ? 'English title'
                      : selectedLocale === 'th_TH'
                        ? 'ชื่อเรื่อง'
                        : '繁體中文標題'
                }
              />
              {errors.title?.[currentLocale] && (
                <p className='text-destructive mt-1 text-sm'>{errors.title[currentLocale]}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 설명 */}
        <Card>
          <CardHeader>
            <CardTitle>설명</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Textarea
                id={`description_${currentLocale}`}
                value={formData.description[currentLocale]}
                onChange={(e) => onUpdateNestedField('description', currentLocale, e.target.value)}
                placeholder={
                  selectedLocale === 'ko_KR'
                    ? '한국어 설명'
                    : selectedLocale === 'en_US'
                      ? 'English description'
                      : selectedLocale === 'th_TH'
                        ? 'คำอธิบาย'
                        : '繁體中文說明'
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* 영상 링크 */}
        <Card>
          <CardHeader>
            <CardTitle>영상 링크 *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Input
                id={`videoUrl_${currentLocale}`}
                type='url'
                value={formData.videoUrl[currentLocale]}
                onChange={(e) => onUpdateNestedField('videoUrl', currentLocale, e.target.value)}
                placeholder={
                  selectedLocale === 'ko_KR'
                    ? '한국어 영상 링크 (YouTube URL)'
                    : selectedLocale === 'en_US'
                      ? 'English video link (YouTube URL)'
                      : selectedLocale === 'th_TH'
                        ? 'ลิงก์วิดีโอ (YouTube URL)'
                        : '繁體中文影片連結 (YouTube URL)'
                }
              />
              {errors.videoUrl?.[currentLocale] && (
                <p className='text-destructive mt-1 text-sm'>{errors.videoUrl[currentLocale]}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
