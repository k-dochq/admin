import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { LiveReviewFormErrors } from '../model/useLiveReviewForm';
import {
  type HospitalLocale,
  type MultilingualField,
  type MultilingualFieldUpdateCallback,
} from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';

interface ContentSectionProps {
  content: MultilingualField;
  errors: LiveReviewFormErrors;
  selectedLocale: HospitalLocale;
  onUpdateContent: MultilingualFieldUpdateCallback;
}

export function ContentSection({
  content,
  errors,
  selectedLocale,
  onUpdateContent,
}: ContentSectionProps) {
  const contentTranslation = useLocalizedFieldTranslation({
    selectedLocale,
    sourceValue: content[selectedLocale] || '',
    onUpdate: (locale, value) => onUpdateContent(locale, value),
    fieldName: 'content',
  });

  const getPlaceholder = (locale: HospitalLocale) => {
    if (locale === 'ko_KR') {
      return '한국어 생생후기 내용';
    } else if (locale === 'en_US') {
      return 'English live review content';
    } else if (locale === 'th_TH') {
      return 'เนื้อหาการรีวิวสด';
    } else {
      return '繁體中文生動評論內容';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>생생후기 내용</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <h3 className='text-sm font-medium'>생생후기 내용 *</h3>
          <div className='relative'>
            <Textarea
              id={`content_${selectedLocale}`}
              value={content[selectedLocale] || ''}
              onChange={(e) => onUpdateContent(selectedLocale, e.target.value)}
              placeholder={getPlaceholder(selectedLocale)}
              rows={6}
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
  );
}
