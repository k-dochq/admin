'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

interface TranslationResponse {
  success: boolean;
  translatedText?: string;
  error?: string;
}

export function useTranslation() {
  const mutation = useMutation({
    mutationFn: async ({ text, sourceLang, targetLang }: TranslationRequest): Promise<string> => {
      // 빈 텍스트 검증
      if (!text.trim()) {
        throw new Error('번역할 텍스트를 입력해주세요.');
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        const errorData: TranslationResponse = await response.json().catch(() => ({
          success: false,
          error: '번역 요청에 실패했습니다.',
        }));

        const errorMessage = errorData.error || `번역 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      const data: TranslationResponse = await response.json();

      if (!data.success || !data.translatedText) {
        const errorMessage = data.error || '번역 결과를 받아오지 못했습니다.';
        throw new Error(errorMessage);
      }

      return data.translatedText;
    },
    onError: (error: Error) => {
      const errorMessage = error.message || '번역 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    },
  });

  return {
    translate: mutation.mutateAsync,
    isTranslating: mutation.isPending,
    error: mutation.error,
  };
}
