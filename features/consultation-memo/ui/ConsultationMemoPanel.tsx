'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConsultationMemoList } from './ConsultationMemoList';
import { ConsultationMemoForm } from './ConsultationMemoForm';
import { useConsultationMemos } from '../model/useConsultationMemos';
import { useCreateConsultationMemo } from '../model/useCreateConsultationMemo';
import { useUpdateConsultationMemo } from '../model/useUpdateConsultationMemo';
import { useDeleteConsultationMemo } from '../model/useDeleteConsultationMemo';

interface ConsultationMemoPanelProps {
  userId: string;
  hospitalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationMemoPanel({
  userId,
  hospitalId,
  open,
  onOpenChange,
}: ConsultationMemoPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { data, isLoading } = useConsultationMemos(userId, hospitalId);
  const createMutation = useCreateConsultationMemo();
  const updateMutation = useUpdateConsultationMemo();
  const deleteMutation = useDeleteConsultationMemo();

  const handleCreate = async (content: string) => {
    await createMutation.mutateAsync({
      userId,
      hospitalId,
      content,
    });
    setIsCreating(false);
  };

  const handleUpdate = async (id: string, content: string) => {
    await updateMutation.mutateAsync({
      id,
      content,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({
      id,
      userId,
      hospitalId,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>상담 메모</SheetTitle>
          <SheetDescription>이 상담에 대한 메모를 작성하고 관리할 수 있습니다.</SheetDescription>
        </SheetHeader>

        <div className='mt-6 flex flex-col gap-4'>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className='w-full'>
              <Plus className='mr-2 h-4 w-4' />새 메모 작성
            </Button>
          )}

          {isCreating && (
            <div className='rounded-lg border bg-gray-50 p-4'>
              <ConsultationMemoForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreating(false)}
                isLoading={createMutation.isPending}
              />
            </div>
          )}

          <div className='flex-1 overflow-y-auto'>
            {isLoading ? (
              <div className='flex h-64 items-center justify-center text-sm text-gray-500'>
                로딩 중...
              </div>
            ) : (
              <ConsultationMemoList
                memos={data || []}
                userId={userId}
                hospitalId={hospitalId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isUpdating={updateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
