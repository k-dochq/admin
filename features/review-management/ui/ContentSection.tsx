import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReviewFormErrors } from '../model/useReviewForm';

interface ContentSectionProps {
  title: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  content: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  concernsMultilingual: {
    ko_KR: string;
    en_US: string;
    th_TH: string;
  };
  errors: ReviewFormErrors;
  onUpdateTitle: (field: string, value: string) => void;
  onUpdateContent: (field: string, value: string) => void;
  onUpdateConcernsMultilingual: (field: string, value: string) => void;
}

export function ContentSection({
  title,
  content,
  concernsMultilingual,
  errors,
  onUpdateTitle,
  onUpdateContent,
  onUpdateConcernsMultilingual,
}: ContentSectionProps) {
  return (
    <div className='space-y-6'>
      {/* 고민부위 */}
      <Card>
        <CardHeader>
          <CardTitle>고민부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='concernsKo' className='text-sm text-gray-500'>
                한국어
              </Label>
              <Input
                id='concernsKo'
                value={concernsMultilingual.ko_KR}
                onChange={(e) => onUpdateConcernsMultilingual('ko_KR', e.target.value)}
                placeholder='예: #쌍꺼풀(자연유착)'
              />
              {errors.concernsMultilingual?.ko_KR && (
                <p className='text-destructive mt-1 text-sm'>{errors.concernsMultilingual.ko_KR}</p>
              )}
            </div>
            <div>
              <Label htmlFor='concernsEn' className='text-sm text-gray-500'>
                영어
              </Label>
              <Input
                id='concernsEn'
                value={concernsMultilingual.en_US}
                onChange={(e) => onUpdateConcernsMultilingual('en_US', e.target.value)}
                placeholder='e.g., #Double eyelids (natural adhesion)'
              />
            </div>
            <div>
              <Label htmlFor='concernsTh' className='text-sm text-gray-500'>
                태국어
              </Label>
              <Input
                id='concernsTh'
                value={concernsMultilingual.th_TH}
                onChange={(e) => onUpdateConcernsMultilingual('th_TH', e.target.value)}
                placeholder='เช่น #ตาสองชั้น (แบบติดธรรมชาติ)'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 제목 */}
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='titleKo' className='text-sm text-gray-500'>
                한국어
              </Label>
              <Input
                id='titleKo'
                value={title.ko_KR}
                onChange={(e) => onUpdateTitle('ko_KR', e.target.value)}
                placeholder='한국어 제목'
              />
              {errors.title?.ko_KR && (
                <p className='text-destructive mt-1 text-sm'>{errors.title.ko_KR}</p>
              )}
            </div>
            <div>
              <Label htmlFor='titleEn' className='text-sm text-gray-500'>
                영어
              </Label>
              <Input
                id='titleEn'
                value={title.en_US}
                onChange={(e) => onUpdateTitle('en_US', e.target.value)}
                placeholder='English title'
              />
            </div>
            <div>
              <Label htmlFor='titleTh' className='text-sm text-gray-500'>
                태국어
              </Label>
              <Input
                id='titleTh'
                value={title.th_TH}
                onChange={(e) => onUpdateTitle('th_TH', e.target.value)}
                placeholder='ชื่อเรื่อง'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 내용 */}
      <Card>
        <CardHeader>
          <CardTitle>리뷰 내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='contentKo' className='text-sm text-gray-500'>
                한국어
              </Label>
              <Textarea
                id='contentKo'
                value={content.ko_KR}
                onChange={(e) => onUpdateContent('ko_KR', e.target.value)}
                placeholder='한국어 리뷰 내용'
                rows={4}
              />
              {errors.content?.ko_KR && (
                <p className='text-destructive mt-1 text-sm'>{errors.content.ko_KR}</p>
              )}
            </div>
            <div>
              <Label htmlFor='contentEn' className='text-sm text-gray-500'>
                영어
              </Label>
              <Textarea
                id='contentEn'
                value={content.en_US}
                onChange={(e) => onUpdateContent('en_US', e.target.value)}
                placeholder='English review content'
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor='contentTh' className='text-sm text-gray-500'>
                태국어
              </Label>
              <Textarea
                id='contentTh'
                value={content.th_TH}
                onChange={(e) => onUpdateContent('th_TH', e.target.value)}
                placeholder='เนื้อหาการรีวิว'
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
