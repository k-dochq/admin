import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import type { LiveReviewFormErrors } from '../model/useLiveReviewForm';
import {
  type HospitalLocale,
  type MultilingualField,
  type MultilingualFieldUpdateCallback,
} from '@/features/hospital-edit/ui/LanguageTabs';
import { TranslateButton } from '@/features/hospital-edit/ui/TranslateButton';
import { useLocalizedFieldTranslation } from '@/features/hospital-edit/model/useLocalizedFieldTranslation';
import { TransformButton } from './TransformButton';
import { useReviewTransform, type TransformStep } from '../model/useReviewTransform';

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

  const reviewTransform = useReviewTransform({
    koreanContent: content.ko_KR || '',
    onUpdateContent,
  });

  const getProgressMessage = (step: TransformStep): string => {
    switch (step) {
      case 'idle':
        return '';
      case 'transforming':
        return '한국어 문맥 변경 중...';
      case 'translating_en':
        return '영어 번역 중...';
      case 'translating_ja':
        return '일본어 번역 중...';
      case 'translating_zh':
        return '중국어 번체 번역 중...';
      case 'translating_th':
        return '태국어 번역 중...';
      case 'completed':
        return '문맥 변경 및 번역 완료!';
      case 'error':
        return '오류가 발생했습니다.';
      default:
        return '';
    }
  };

  const getPlaceholder = (locale: HospitalLocale) => {
    if (locale === 'ko_KR') {
      return '한국어 생생후기 내용';
    } else if (locale === 'en_US') {
      return 'English live review content';
    } else if (locale === 'th_TH') {
      return 'เนื้อหาการรีวิวสด';
    } else if (locale === 'zh_TW') {
      return '繁體中文生動評論內容';
    } else {
      // ja_JP
      return '日本語ライブレビュー内容';
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
              rows={12}
              disabled={contentTranslation.isTranslating || reviewTransform.isTransforming}
              className={selectedLocale === 'ko_KR' ? 'pr-32' : 'pr-10'}
            />
            {selectedLocale === 'ko_KR' && (
              <div className='absolute top-2 right-2'>
                <TransformButton
                  onClick={reviewTransform.handleTransform}
                  disabled={!reviewTransform.canTransform}
                  isTransforming={reviewTransform.isTransforming}
                />
              </div>
            )}
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
          {reviewTransform.isTransforming && (
            <div className='mt-3 space-y-2'>
              <Progress value={reviewTransform.progress.percentage} />
              <p className='text-muted-foreground text-sm'>
                {getProgressMessage(reviewTransform.progress.step)}
              </p>
            </div>
          )}
          {reviewTransform.error && (
            <p className='text-destructive mt-2 text-sm'>{reviewTransform.error}</p>
          )}
          {errors.content?.[selectedLocale] && (
            <p className='text-destructive mt-1 text-sm'>{errors.content[selectedLocale]}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
