'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, Pin, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type ConsultationMemoWithRelations } from '../api/entities/types';
import { ConsultationMemoForm } from './ConsultationMemoForm';
import { useToggleMemoPin, useToggleMemoComplete } from '../model';

interface ConsultationMemoItemProps {
  memo: ConsultationMemoWithRelations;
  userId: string;
  hospitalId: string;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isUpdated(createdAt: Date | string, updatedAt: Date | string): boolean {
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return updated !== created;
}

export function ConsultationMemoItem({
  memo,
  userId,
  hospitalId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ConsultationMemoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const togglePinMutation = useToggleMemoPin();
  const toggleCompleteMutation = useToggleMemoComplete();

  const handleUpdate = async (content: string) => {
    await onUpdate(memo.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(memo.id);
    setShowDeleteDialog(false);
  };

  const handleTogglePin = async () => {
    await togglePinMutation.mutateAsync({
      id: memo.id,
      userId,
      hospitalId,
    });
  };

  const handleToggleComplete = async () => {
    await toggleCompleteMutation.mutateAsync({
      id: memo.id,
      userId,
      hospitalId,
    });
  };

  // Prisma 타입이 재생성되면 타입 에러가 해결됩니다
  const isPinned =
    (memo as ConsultationMemoWithRelations & { isPinned?: boolean | null }).isPinned === true;
  const isCompleted =
    (memo as ConsultationMemoWithRelations & { isCompleted?: boolean | null }).isCompleted === true;

  if (isEditing) {
    return (
      <div className='rounded-lg border bg-white p-4'>
        <ConsultationMemoForm
          initialContent={memo.content}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isUpdating}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className={`group rounded-lg border p-4 transition-shadow hover:shadow-md ${
          isPinned ? 'border-blue-200 bg-blue-50' : 'bg-white'
        } ${isCompleted ? 'opacity-60' : ''}`}
      >
        <div className='mb-2 flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <div className='flex items-start gap-2'>
              {isPinned && (
                <Pin className='mt-0.5 h-4 w-4 flex-shrink-0 fill-blue-500 text-blue-500' />
              )}
              <p
                className={`text-sm whitespace-pre-wrap ${
                  isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {memo.content}
              </p>
            </div>
          </div>
          <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={handleTogglePin}
              disabled={
                isUpdating ||
                isDeleting ||
                togglePinMutation.isPending ||
                toggleCompleteMutation.isPending
              }
              className={isPinned ? 'text-blue-600 hover:text-blue-700' : ''}
              title={isPinned ? '상단 고정 해제' : '상단 고정'}
            >
              <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={handleToggleComplete}
              disabled={
                isUpdating ||
                isDeleting ||
                togglePinMutation.isPending ||
                toggleCompleteMutation.isPending
              }
              className={isCompleted ? 'text-green-600 hover:text-green-700' : ''}
              title={isCompleted ? '완료 처리 해제' : '완료 처리'}
            >
              <Check className={`h-4 w-4 ${isCompleted ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => setIsEditing(true)}
              disabled={
                isUpdating ||
                isDeleting ||
                togglePinMutation.isPending ||
                toggleCompleteMutation.isPending
              }
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => setShowDeleteDialog(true)}
              disabled={
                isUpdating ||
                isDeleting ||
                togglePinMutation.isPending ||
                toggleCompleteMutation.isPending
              }
            >
              <Trash2 className='text-destructive h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            <span>{formatDateTime(memo.createdAt)}</span>
            {isUpdated(memo.createdAt, memo.updatedAt) && <span className='ml-2'>(수정됨)</span>}
          </div>
          {memo.Creator && (
            <span className='text-gray-400'>
              • 작성자: {memo.Creator.displayName || memo.Creator.name || memo.Creator.email || '-'}
            </span>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>메모 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 메모를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
