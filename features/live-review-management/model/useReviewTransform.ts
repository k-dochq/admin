import { useState } from 'react';
import type { HospitalLocale } from '@/features/hospital-edit/ui/LanguageTabs';

interface UseReviewTransformParams {
  koreanContent: string;
  onUpdateContent: (locale: HospitalLocale, value: string) => void;
}

export type TransformStep =
  | 'idle'
  | 'transforming'
  | 'translating_en'
  | 'translating_ja'
  | 'translating_zh'
  | 'translating_th'
  | 'completed'
  | 'error';

interface TransformProgress {
  step: TransformStep;
  percentage: number;
  currentLanguage?: string;
}

// 언어 코드 매핑
const LOCALE_TO_LANG_CODE: Record<string, string> = {
  ko_KR: 'ko',
  en_US: 'en',
  ja_JP: 'ja',
  zh_TW: 'zh-TW',
  th_TH: 'th',
};

// 언어 표시명
const LANGUAGE_NAMES: Record<string, string> = {
  en: '영어',
  ja: '일본어',
  'zh-TW': '중국어',
  th: '태국어',
};

// 진행 단계별 퍼센트
const PROGRESS_STEPS: Record<TransformStep, number> = {
  idle: 0,
  transforming: 20,
  translating_en: 40,
  translating_ja: 60,
  translating_zh: 80,
  translating_th: 100,
  completed: 100,
  error: 0,
};

export function useReviewTransform({ koreanContent, onUpdateContent }: UseReviewTransformParams) {
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState<TransformProgress>({
    step: 'idle',
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleTransform = async () => {
    if (!koreanContent || koreanContent.trim().length === 0) {
      setError('한국어 내용이 비어있습니다.');
      return;
    }

    setIsTransforming(true);
    setError(null);
    setProgress({ step: 'transforming', percentage: 0, currentLanguage: '한국어' });

    try {
      // 1단계: 한국어 문맥 변경
      const transformResponse = await fetch('/api/transform-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review: koreanContent }),
      });

      if (!transformResponse.ok) {
        const errorData = await transformResponse.json();
        throw new Error(errorData.error || '문맥 변경에 실패했습니다.');
      }

      const transformData = await transformResponse.json();
      if (!transformData.success || !transformData.transformedText) {
        throw new Error('문맥 변경 결과가 없습니다.');
      }

      const transformedKorean = transformData.transformedText;

      // 한국어 필드 업데이트
      onUpdateContent('ko_KR', transformedKorean);
      setProgress({ step: 'transforming', percentage: PROGRESS_STEPS.transforming });

      // 2-5단계: 각 언어별 번역
      const translationSteps: Array<{
        step: TransformStep;
        locale: HospitalLocale;
        langCode: string;
        displayName: string;
      }> = [
        { step: 'translating_en', locale: 'en_US', langCode: 'en', displayName: '영어' },
        { step: 'translating_ja', locale: 'ja_JP', langCode: 'ja', displayName: '일본어' },
        { step: 'translating_zh', locale: 'zh_TW', langCode: 'zh-TW', displayName: '중국어 번체' },
        { step: 'translating_th', locale: 'th_TH', langCode: 'th', displayName: '태국어' },
      ];

      const failedLanguages: string[] = [];

      for (const { step, locale, langCode, displayName } of translationSteps) {
        setProgress({ step, percentage: PROGRESS_STEPS[step] - 10, currentLanguage: displayName });

        try {
          const translateResponse = await fetch('/api/translate-review', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: transformedKorean,
              targetLanguage: LANGUAGE_NAMES[langCode],
            }),
          });

          if (!translateResponse.ok) {
            throw new Error(`${displayName} 번역 실패`);
          }

          const translateData = await translateResponse.json();
          if (!translateData.success || !translateData.translatedText) {
            throw new Error(`${displayName} 번역 결과가 없습니다.`);
          }

          // 해당 언어 필드 업데이트
          onUpdateContent(locale, translateData.translatedText);
          setProgress({ step, percentage: PROGRESS_STEPS[step] });
        } catch (translationError) {
          console.error(`Translation error for ${displayName}:`, translationError);
          failedLanguages.push(displayName);
          // 부분 성공 처리: 계속 진행
        }
      }

      // 완료
      setProgress({ step: 'completed', percentage: 100 });

      // 실패한 언어가 있으면 알림
      if (failedLanguages.length > 0) {
        setError(`일부 언어 번역에 실패했습니다: ${failedLanguages.join(', ')}`);
      }
    } catch (err) {
      console.error('Transform error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setProgress({ step: 'error', percentage: 0 });
    } finally {
      setIsTransforming(false);
    }
  };

  const canTransform = koreanContent.trim().length > 0 && !isTransforming;

  return {
    isTransforming,
    progress,
    error,
    handleTransform,
    canTransform,
  };
}
