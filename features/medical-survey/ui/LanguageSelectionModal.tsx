'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  type HospitalLocale,
  HOSPITAL_LOCALE_LABELS,
  HOSPITAL_LOCALE_FLAGS,
} from '@/shared/lib/types/locale';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (language: HospitalLocale) => void;
  title?: string;
}

const LANGUAGES: HospitalLocale[] = ['ko_KR', 'en_US', 'zh_TW', 'ja_JP', 'th_TH'];

export function LanguageSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title = '질문 언어 선택',
}: LanguageSelectionModalProps) {
  const handleLanguageSelect = (language: HospitalLocale) => {
    onSelect(language);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2 py-4'>
          {LANGUAGES.map((language) => (
            <Button
              key={language}
              variant='outline'
              className='flex h-auto items-center justify-start gap-3 px-4 py-3'
              onClick={() => handleLanguageSelect(language)}
            >
              <span className='text-2xl'>{HOSPITAL_LOCALE_FLAGS[language]}</span>
              <span className='text-base'>{HOSPITAL_LOCALE_LABELS[language]}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
