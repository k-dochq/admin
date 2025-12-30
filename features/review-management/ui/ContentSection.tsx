import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ReviewFormErrors } from '../model/useReviewForm';
import {
  type HospitalLocale,
  type MultilingualField,
  type MultilingualFieldUpdateCallback,
} from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';

interface ContentSectionProps {
  title: MultilingualField;
  content: MultilingualField;
  concernsMultilingual: MultilingualField;
  errors: ReviewFormErrors;
  selectedLocale: HospitalLocale;
  onUpdateTitle: MultilingualFieldUpdateCallback;
  onUpdateContent: MultilingualFieldUpdateCallback;
  onUpdateConcernsMultilingual: MultilingualFieldUpdateCallback;
}

export function ContentSection({
  title,
  content,
  concernsMultilingual,
  errors,
  selectedLocale,
  onUpdateTitle,
  onUpdateContent,
  onUpdateConcernsMultilingual,
}: ContentSectionProps) {
  // 각 필드별 번역 훅 - 입력란의 현재 텍스트를 소스로 사용
  const concernsTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: concernsMultilingual[selectedLocale] || '',
    onUpdate: (locale, value) => onUpdateConcernsMultilingual(locale, value),
    fieldName: 'concernsMultilingual',
  });

  const titleTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: title[selectedLocale] || '',
    onUpdate: (locale, value) => onUpdateTitle(locale, value),
    fieldName: 'title',
  });

  const contentTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: content[selectedLocale] || '',
    onUpdate: (locale, value) => onUpdateContent(locale, value),
    fieldName: 'content',
  });

  const getPlaceholder = (field: string, locale: HospitalLocale) => {
    if (locale === 'ko_KR') {
      return {
        concerns: '예: #쌍꺼풀(자연유착)',
        title: '한국어 제목',
        content: '한국어 리뷰 내용',
      }[field];
    } else if (locale === 'en_US') {
      return {
        concerns: 'e.g., #Double eyelids (natural adhesion)',
        title: 'English title',
        content: 'English review content',
      }[field];
    } else if (locale === 'th_TH') {
      return {
        concerns: 'เช่น #ตาสองชั้น (แบบติดธรรมชาติ)',
        title: 'ชื่อเรื่อง',
        content: 'เนื้อหาการรีวิว',
      }[field];
    } else {
      return {
        concerns: '例如：#雙眼皮（自然粘連）',
        title: '繁體中文標題',
        content: '繁體中文評論內容',
      }[field];
    }
  };

  return (
    <div className='space-y-6'>
      {/* 고민부위 */}
      <Card>
        <CardHeader>
          <CardTitle>고민부위</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>고민부위 *</h3>
            <div className='relative'>
              <Input
                id={`concerns_${selectedLocale}`}
                value={concernsMultilingual[selectedLocale] || ''}
                onChange={(e) => onUpdateConcernsMultilingual(selectedLocale, e.target.value)}
                placeholder={getPlaceholder('concerns', selectedLocale)}
                disabled={concernsTranslation.isTranslating}
                className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
              />
              {selectedLocale !== 'ko_KR' && (
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                  <TranslateButton
                    onClick={concernsTranslation.handleTranslate}
                    disabled={!concernsTranslation.canTranslate}
                    isTranslating={concernsTranslation.isTranslating}
                  />
                </div>
              )}
            </div>
            {errors.concernsMultilingual?.[selectedLocale] && (
              <p className='text-destructive mt-1 text-sm'>
                {errors.concernsMultilingual[selectedLocale]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 제목 */}
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>제목 *</h3>
            <div className='relative'>
              <Input
                id={`title_${selectedLocale}`}
                value={title[selectedLocale] || ''}
                onChange={(e) => onUpdateTitle(selectedLocale, e.target.value)}
                placeholder={getPlaceholder('title', selectedLocale)}
                disabled={titleTranslation.isTranslating}
                className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
              />
              {selectedLocale !== 'ko_KR' && (
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                  <TranslateButton
                    onClick={titleTranslation.handleTranslate}
                    disabled={!titleTranslation.canTranslate}
                    isTranslating={titleTranslation.isTranslating}
                  />
                </div>
              )}
            </div>
            {errors.title?.[selectedLocale] && (
              <p className='text-destructive mt-1 text-sm'>{errors.title[selectedLocale]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 내용 */}
      <Card>
        <CardHeader>
          <CardTitle>리뷰 내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>리뷰 내용 *</h3>
            <div className='relative'>
              <Textarea
                id={`content_${selectedLocale}`}
                value={content[selectedLocale] || ''}
                onChange={(e) => onUpdateContent(selectedLocale, e.target.value)}
                placeholder={getPlaceholder('content', selectedLocale)}
                rows={4}
                disabled={contentTranslation.isTranslating}
                className={selectedLocale !== 'ko_KR' ? 'pr-10' : ''}
              />
              {selectedLocale !== 'ko_KR' && (
                <div className='absolute top-2 right-2'>
                  <TranslateButton
                    onClick={contentTranslation.handleTranslate}
                    disabled={!contentTranslation.canTranslate}
                    isTranslating={contentTranslation.isTranslating}
                  />
                </div>
              )}
            </div>
            {errors.content?.[selectedLocale] && (
              <p className='text-destructive mt-1 text-sm'>{errors.content[selectedLocale]}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
