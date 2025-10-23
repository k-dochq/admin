'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { useNoticeById } from '@/lib/queries/notices';
import { useCreateNotice, useUpdateNotice } from '@/lib/mutations/notice-create';
import { LoadingSpinner } from '@/shared/ui';
import { useNoticeForm } from '../model/useNoticeForm';
import { NoticeTitleSection } from './NoticeTitleSection';
import { NoticeContentSection } from './NoticeContentSection';
import { FileUploadSection } from './FileUploadSection';

interface NoticeFormProps {
  mode: 'add' | 'edit';
  noticeId?: string;
}

export function NoticeForm({ mode, noticeId }: NoticeFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  // 수정 모드일 때만 공지사항 데이터 조회
  const { data, isLoading, error } = useNoticeById(isEditMode && noticeId ? noticeId : '');

  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();

  const { formData, errors, isDirty, updateNestedField, updateField, validateForm, hasErrors } =
    useNoticeForm(isEditMode ? data : undefined);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && noticeId) {
        await updateNoticeMutation.mutateAsync({
          id: noticeId,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          isActive: formData.isActive,
        });
      } else {
        await createNoticeMutation.mutateAsync({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          isActive: formData.isActive,
        });
      }

      router.push('/admin/notices');
    } catch (error) {
      console.error('Error saving notice:', error);
    }
  };

  const isSubmitting = createNoticeMutation.isPending || updateNoticeMutation.isPending;

  // 로딩 상태
  if (isEditMode && isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner />
      </div>
    );
  }

  // 에러 상태
  if (isEditMode && error) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>공지사항을 불러오는데 실패했습니다.</p>
          <Button onClick={() => router.push('/admin/notices')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 수정 모드에서 공지사항 데이터가 없음
  if (isEditMode && !data) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>공지사항을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/notices')} variant='outline'>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? '공지사항 수정' : '공지사항 작성';
  const submitButtonText = isEditMode ? '저장' : '생성';
  const submitIcon = isEditMode ? Save : Plus;

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/notices')}
          className='flex items-center'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          뒤로가기
        </Button>
        <h1 className='text-2xl font-bold'>{pageTitle}</h1>
      </div>

      <div className='flex justify-end'>
        <Button
          onClick={handleSubmit}
          disabled={(!isDirty && isEditMode) || hasErrors || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            React.createElement(submitIcon, { className: 'mr-2 h-4 w-4' })
          )}
          {submitButtonText}
        </Button>
      </div>

      {/* 폼 섹션들 */}
      <div className='space-y-6'>
        {/* 제목 섹션 */}
        <NoticeTitleSection
          title={formData.title}
          errors={errors}
          onUpdateTitle={(field: 'ko_KR' | 'en_US' | 'th_TH', value: string) =>
            updateNestedField('title', field, value)
          }
        />

        {/* 내용 섹션 */}
        <NoticeContentSection
          content={formData.content}
          errors={errors}
          onUpdateContent={(field: 'ko_KR' | 'en_US' | 'th_TH', value: string) =>
            updateNestedField('content', field, value)
          }
        />

        {/* 타입 선택 섹션 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>공지사항 타입</label>
          <Select
            value={formData.type || ''}
            onValueChange={(value) => updateField('type', value as 'INFO' | 'EVENT')}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='공지사항 타입을 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='INFO'>정보 공지</SelectItem>
              <SelectItem value='EVENT'>이벤트 공지</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className='text-destructive text-sm'>{errors.type}</p>}
        </div>

        {/* 파일 업로드 섹션 (수정 모드에서만) */}
        {isEditMode && noticeId && <FileUploadSection noticeId={noticeId} />}
      </div>
    </div>
  );
}
