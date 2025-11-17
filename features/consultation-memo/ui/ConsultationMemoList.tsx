'use client';

import { useMemo } from 'react';
import {
  type ConsultationMemoWithRelations,
  type GroupedConsultationMemo,
} from '../api/entities/types';
import { ConsultationMemoItem } from './ConsultationMemoItem';

interface ConsultationMemoListProps {
  memos: ConsultationMemoWithRelations[];
  userId: string;
  hospitalId: string;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

function formatDate(date: Date | string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const memoDate = new Date(date);
  memoDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (memoDate.getTime() === today.getTime()) {
    return '오늘';
  }
  if (memoDate.getTime() === yesterday.getTime()) {
    return '어제';
  }

  return memoDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function groupMemosByDate(memos: ConsultationMemoWithRelations[]): GroupedConsultationMemo[] {
  // 상단 고정된 메모와 일반 메모 분리
  // Prisma 타입이 재생성되면 타입 에러가 해결됩니다
  const typedMemos = memos as Array<
    ConsultationMemoWithRelations & { isPinned?: boolean | null; isCompleted?: boolean | null }
  >;
  const pinnedMemos = typedMemos.filter((memo) => memo.isPinned === true);
  const unpinnedMemos = typedMemos.filter((memo) => memo.isPinned !== true);

  // 상단 고정된 메모를 별도 그룹으로 처리
  const pinnedGroup: GroupedConsultationMemo | null =
    pinnedMemos.length > 0
      ? {
          date: 'pinned',
          memos: pinnedMemos.sort((a, b) => {
            // 상단 고정된 메모 내에서도 날짜순 정렬 (최신순)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }),
        }
      : null;

  // 일반 메모를 날짜별로 그룹화
  const grouped = new Map<string, ConsultationMemoWithRelations[]>();

  unpinnedMemos.forEach((memo) => {
    const dateKey = new Date(memo.createdAt).toISOString().split('T')[0]!;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(memo);
  });

  const dateGroups = Array.from(grouped.entries())
    .map(([date, memos]) => ({
      date,
      memos: memos.sort((a, b) => {
        // 같은 날짜 내에서도 시간순 정렬 (최신순)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // 상단 고정 그룹이 있으면 맨 앞에 추가
  return pinnedGroup ? [pinnedGroup, ...dateGroups] : dateGroups;
}

export function ConsultationMemoList({
  memos,
  userId,
  hospitalId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ConsultationMemoListProps) {
  const groupedMemos = useMemo(() => groupMemosByDate(memos), [memos]);

  if (memos.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-gray-500'>
        작성된 메모가 없습니다.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {groupedMemos.map((group) => (
        <div key={group.date} className='space-y-3'>
          <div className='sticky top-0 z-10 bg-white py-2'>
            <h3 className='text-sm font-semibold text-gray-700'>
              {group.date === 'pinned' ? '상단 고정' : formatDate(new Date(group.date))}
            </h3>
          </div>
          <div className='space-y-3'>
            {group.memos.map((memo) => (
              <ConsultationMemoItem
                key={memo.id}
                memo={memo}
                userId={userId}
                hospitalId={hospitalId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
