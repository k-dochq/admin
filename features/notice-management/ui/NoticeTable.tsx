'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Megaphone, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import {
  type GetNoticesResponse,
  type NoticeWithFiles,
  type LocalizedText,
  getLocalizedTextValue,
} from '@/features/notice-management/api';
import { LoadingSpinner } from '@/shared/ui';
import { useDeleteNotice } from '@/lib/mutations/notice-delete';
import { toast } from 'sonner';

interface NoticeTableProps {
  data?: GetNoticesResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function NoticeTable({ data, isLoading, isFetching, page, onPageChange }: NoticeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const deleteNoticeMutation = useDeleteNotice();

  const handleDeleteClick = (notice: NoticeWithFiles) => {
    setNoticeToDelete({
      id: notice.id,
      title: getNoticeTitle(notice.title),
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;

    try {
      await deleteNoticeMutation.mutateAsync({ id: noticeToDelete.id });
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.');
    }
  };

  const getNoticeTitle = (title: Prisma.JsonValue): string => {
    return (
      getLocalizedTextValue(title, 'ko_KR') ||
      getLocalizedTextValue(title, 'en_US') ||
      getLocalizedTextValue(title, 'th_TH') ||
      '제목 없음'
    );
  };

  const getNoticeContentPreview = (content: Prisma.JsonValue): string => {
    const contentText =
      getLocalizedTextValue(content, 'ko_KR') ||
      getLocalizedTextValue(content, 'en_US') ||
      getLocalizedTextValue(content, 'th_TH') ||
      '';

    // HTML 태그 제거 및 미리보기 텍스트 생성
    const plainText = contentText.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  const getFileCount = (noticeFiles: NoticeWithFiles['noticeFiles']): number => {
    return noticeFiles.length;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.notices.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Megaphone className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>공지사항이 없습니다</h3>
            <p className='mt-1 text-sm text-gray-500'>새로운 공지사항을 작성해보세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>공지사항 목록</CardTitle>
        </CardHeader>
        <CardContent className='relative'>
          {/* 로딩 오버레이 */}
          {isFetching && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px]'>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-gray-400'></div>
                로딩 중...
              </div>
            </div>
          )}

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>내용 미리보기</TableHead>
                  <TableHead>첨부파일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead className='text-right'>액션</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.notices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className='font-medium'>{getNoticeTitle(notice.title)}</TableCell>
                    <TableCell className='max-w-xs'>
                      <div className='truncate text-sm text-gray-600'>
                        {getNoticeContentPreview(notice.content)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{getFileCount(notice.noticeFiles)}개</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notice.isActive ? 'default' : 'secondary'}>
                        {notice.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Button variant='ghost' size='sm' title='상세보기'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' asChild title='수정하기'>
                          <Link href={`/admin/notices/${notice.id}/edit`}>
                            <Edit className='h-4 w-4' />
                          </Link>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive'
                          title='삭제하기'
                          onClick={() => handleDeleteClick(notice)}
                          disabled={deleteNoticeMutation.isPending}
                        >
                          {deleteNoticeMutation.isPending && noticeToDelete?.id === notice.id ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{noticeToDelete?.title}" 공지사항을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
