'use client';

import { useState } from 'react';
import { useTranslation } from '@/features/admin-consultation-chat/model/useTranslation';
import { type HospitalLocale } from '../ui/LanguageTabs';
import { localeToLangCode } from '../lib/locale-utils';

interface UseLocalizedFieldTranslationParams {
  selectedLocale: HospitalLocale;
  sourceValue: string;
  onUpdate: (locale: HospitalLocale, value: string) => void;
  fieldName: string;
}

/**
 * 다국어 필드 번역을 위한 커스텀 훅
 * 입력란의 현재 텍스트를 선택된 로케일로 번역하는 로직을 제공합니다.
 */
export function useLocalizedFieldTranslation({
  selectedLocale,
  sourceValue,
  onUpdate,
  fieldName,
}: UseLocalizedFieldTranslationParams) {
  const { translate, isTranslating } = useTranslation();
  const [isFieldTranslating, setIsFieldTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceValue.trim()) {
      return;
    }

    setIsFieldTranslating(true);
    const sourceLang = 'ko';
    const targetLang = localeToLangCode(selectedLocale); // 선택된 로케일로 번역

    try {
      // 입력란의 텍스트를 선택된 언어로 번역
      const translatedText = await translate({
        text: sourceValue,
        sourceLang,
        targetLang,
      });

      // 번역 결과를 선택된 로케일 필드에 업데이트
      onUpdate(selectedLocale, translatedText);
    } catch (error) {
      // 에러는 useTranslation의 onError에서 이미 toast로 표시됨
    } finally {
      setIsFieldTranslating(false);
    }
  };

  return {
    handleTranslate,
    isTranslating: isTranslating && isFieldTranslating,
    canTranslate: !!sourceValue.trim(),
  };
}
