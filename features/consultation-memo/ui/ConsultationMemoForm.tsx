'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ConsultationMemoFormProps {
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConsultationMemoForm({
  initialContent = '',
  onSubmit,
  onCancel,
  isLoading = false,
}: ConsultationMemoFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='메모를 입력하세요...'
        rows={4}
        disabled={isLoading}
        className='resize-none'
      />
      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
          취소
        </Button>
        <Button type='submit' disabled={isLoading || !content.trim()}>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {initialContent ? '수정' : '저장'}
        </Button>
      </div>
    </form>
  );
}
