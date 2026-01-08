'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { analyzeMessageContent } from '../lib/message-content-handler';

const Editor = dynamic(
  () => import('@/components/ui/editor').then((mod) => ({ default: mod.Editor })),
  { ssr: false },
);

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onSave: (newContent: string) => Promise<void>;
}

export function EditMessageModal({
  isOpen,
  onClose,
  currentContent,
  onSave,
}: EditMessageModalProps) {
  const [content, setContent] = useState(currentContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 현재 내용 분석
      const analysis = analyzeMessageContent(currentContent);

      // 에디터 태그가 있으면 내용만 추출, 없으면 전체 내용 사용
      if (analysis.hasEditor && analysis.editorContent) {
        setContent(analysis.editorContent);
      } else {
        // 일반 텍스트를 HTML로 변환
        setContent(`<p>${currentContent}</p>`);
      }
    }
  }, [isOpen, currentContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 에디터 태그로 감싸서 저장
      const wrappedContent = `<editor>${content}</editor>`;
      await onSave(wrappedContent);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-6xl min-w-6xl'>
        <DialogHeader>
          <DialogTitle>메시지 수정</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <Editor content={content} onChange={setContent} placeholder='메시지를 수정하세요...' />
        </div>
        <div className='mt-4 flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
