'use client';

import { useState } from 'react';
import { Edit, Trash2, Calendar } from 'lucide-react';
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
import { LoadingSpinner } from '@/shared/ui';
import { useDeleteBanner } from '@/lib/mutations/banner-mutations';
import {
  type GetBannersResponse,
  type EventBannerWithImages,
  type MultilingualTitle,
  BANNER_TYPE_LABELS,
} from '@/features/banner-management/api';
import { IMAGE_LOCALE_LABELS, IMAGE_LOCALE_FLAGS } from '@/features/banner-management/api';
import { useRouter } from 'next/navigation';
import { type EventBannerType } from '@prisma/client';

interface BannerTableProps {
  data?: GetBannersResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  bannerType: EventBannerType;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: boolean | undefined) => void;
}

export function BannerTable({
  data,
  isLoading,
  isFetching,
  page,
  bannerType,
  onPageChange,
  onFilterChange,
}: BannerTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const deleteMutation = useDeleteBanner();

  const handleEdit = (id: string) => {
    const typePath = bannerType.toLowerCase();
    router.push(`/admin/banners/${typePath}/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete) {
      await deleteMutation.mutateAsync(bannerToDelete);
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const getImageCount = (banner: EventBannerWithImages) => {
    return banner.bannerImages?.length || 0;
  };

  const getImageLocales = (banner: EventBannerWithImages) => {
    return banner.bannerImages?.map((img) => img.locale) || [];
  };

  if (isLoading) {
    return <LoadingSpinner text='배너를 불러오는 중...' />;
  }

  if (!data || data.banners.length === 0) {
    return (
      <div className='py-8 text-center'>
        <p className='text-muted-foreground'>등록된 배너가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>이미지</TableHead>
              <TableHead>링크</TableHead>
              <TableHead>배너 타입</TableHead>
              <TableHead>순서</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className='text-right'>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='font-medium'>
                      {(banner.title as MultilingualTitle)?.ko || '제목 없음'}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      {(banner.title as MultilingualTitle)?.en || 'No title'} /{' '}
                      {(banner.title as MultilingualTitle)?.th || 'ไม่มีชื่อ'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-1'>
                    {getImageLocales(banner).map((locale: string) => (
                      <Badge key={locale} variant='secondary' className='text-xs'>
                        {IMAGE_LOCALE_FLAGS[locale as keyof typeof IMAGE_LOCALE_FLAGS]}{' '}
                        {IMAGE_LOCALE_LABELS[locale as keyof typeof IMAGE_LOCALE_LABELS]}
                      </Badge>
                    ))}
                    <span className='text-muted-foreground text-sm'>
                      ({getImageCount(banner)}장)
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {banner.linkUrl ? (
                    <div className='max-w-[120px] truncate text-sm' title={banner.linkUrl}>
                      {banner.linkUrl}
                    </div>
                  ) : (
                    <span className='text-muted-foreground text-sm'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  {banner.type ? (
                    <Badge variant='secondary'>{BANNER_TYPE_LABELS[banner.type]}</Badge>
                  ) : (
                    <span className='text-muted-foreground text-sm'>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>{banner.order}</Badge>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div className='text-sm'>
                      <Calendar className='mr-1 inline h-3 w-3' />
                      {formatDate(banner.startDate)}
                    </div>
                    {banner.endDate && (
                      <div className='text-muted-foreground text-sm'>
                        ~ {formatDate(banner.endDate)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                    {banner.isActive ? '활성' : '비활성'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='text-muted-foreground text-sm'>
                    {formatDate(banner.createdAt)}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end space-x-2'>
                    <Button variant='outline' size='sm' onClick={() => handleEdit(banner.id)}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDelete(banner.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {data.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
            총 {data.total}개의 배너 중 {(page - 1) * data.limit + 1}-
            {Math.min(page * data.limit, data.total)}개 표시
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              이전
            </Button>
            <span className='text-sm'>
              {page} / {data.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배너 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
