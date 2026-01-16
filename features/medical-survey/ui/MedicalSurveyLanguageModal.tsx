'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type HospitalLocale,
  HOSPITAL_LOCALE_LABELS,
  HOSPITAL_LOCALE_FLAGS,
} from '@/shared/lib/types/locale';

interface MedicalSurveyLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (language: HospitalLocale, cooldownDays?: number) => void;
}

const LANGUAGES: HospitalLocale[] = ['ko_KR', 'en_US', 'zh_TW', 'ja_JP', 'th_TH', 'hi_IN'];

export function MedicalSurveyLanguageModal({
  isOpen,
  onClose,
  onSelect,
}: MedicalSurveyLanguageModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<HospitalLocale | null>(null);
  const [cooldownDays, setCooldownDays] = useState<string>('');

  const handleLanguageSelect = (language: HospitalLocale) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = () => {
    if (!selectedLanguage) return;

    const cooldownDaysNum = cooldownDays ? parseInt(cooldownDays, 10) : undefined;
    if (cooldownDays && (isNaN(cooldownDaysNum!) || cooldownDaysNum! < 0)) {
      alert('올바른 기간을 입력해주세요. (0 이상의 숫자)');
      return;
    }

    onSelect(selectedLanguage, cooldownDaysNum);
    setSelectedLanguage(null);
    setCooldownDays('');
    onClose();
  };

  const handleClose = () => {
    setSelectedLanguage(null);
    setCooldownDays('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>질문 언어 선택</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label>언어 선택</Label>
            {LANGUAGES.map((language) => (
              <Button
                key={language}
                variant={selectedLanguage === language ? 'default' : 'outline'}
                className='flex h-auto items-center justify-start gap-3 px-4 py-3'
                onClick={() => handleLanguageSelect(language)}
              >
                <span className='text-2xl'>{HOSPITAL_LOCALE_FLAGS[language]}</span>
                <span className='text-base'>{HOSPITAL_LOCALE_LABELS[language]}</span>
              </Button>
            ))}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='cooldown-days'>중복 설문 불가 기간 (일)</Label>
            <Input
              id='cooldown-days'
              type='number'
              min='0'
              placeholder='예: 7 (7일간 중복 작성 불가)'
              value={cooldownDays}
              onChange={(e) => setCooldownDays(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>비워두면 중복 작성 제한이 없습니다.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLanguage}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
