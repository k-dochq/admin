'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Edit, Eye, Video, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useYoutubeVideos, useDeleteYoutubeVideo } from '@/lib/queries/youtube-videos';
import { useYoutubeVideoCategories } from '@/lib/queries/youtube-video-categories';
import { useRouter } from 'next/navigation';
import { useAdminListUrl } from '@/lib/hooks/use-admin-list-url';
import { YoutubeVideoDetailDialog } from './YoutubeVideoDetailDialog';
import type { YoutubeVideoForList } from '../api/entities/types';

export function YoutubeVideoManagement() {
  const router = useRouter();
  const { updateURL, returnToListPath, resetUrl, searchParams } = useAdminListUrl(
    'youtube-videos',
    { treatAllAsEmpty: true },
  );
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const categoryId = searchParams.get('categoryId') ?? 'all';
  const isActive = searchParams.get('isActive') ?? 'all';
  const [selectedVideo, setSelectedVideo] = useState<YoutubeVideoForList | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const limit = 10;

  // 데이터 조회
  const {
    data: videosData,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useYoutubeVideos({
    page,
    limit,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    isActive:
      isActive === 'all'
        ? undefined
        : isActive === 'true'
          ? true
          : isActive === 'false'
            ? false
            : undefined,
  });

  const { data: categoriesData } = useYoutubeVideoCategories();
  const deleteVideoMutation = useDeleteYoutubeVideo();

  // 필터 초기화
  const handleResetFilters = () => {
    resetUrl();
  };

  // 영상 삭제
  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      await deleteVideoMutation.mutateAsync(selectedVideo.id);
      setDeleteDialogOpen(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko as string) ||
        (textObj.en as string) ||
        (textObj.th as string) ||
        (textObj.zh as string) ||
        (textObj.ja as string) ||
        ''
      );
    }
    return '';
  };

  const videos = videosData?.videos || [];
  const total = videosData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const categories = categoriesData?.categories || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>영상 관리</h1>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={() => router.push('/admin/youtube-videos/categories')}>
            카테고리 관리
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/admin/youtube-videos/add?returnTo=${encodeURIComponent(returnToListPath)}`,
              )
            }
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            영상 추가
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  updateURL({ categoryId: v === 'all' ? null : v, page: '1' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='카테고리 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {getLocalizedText(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={isActive}
                onValueChange={(v) => {
                  updateURL({ isActive: v === 'all' ? null : v, page: '1' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='활성화 여부' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  <SelectItem value='true'>활성화</SelectItem>
                  <SelectItem value='false'>비활성화</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleResetFilters} variant='outline' className='w-full'>
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영상 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>영상 목록 ({total}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isPlaceholderData ? (
            <LoadingSpinner text='영상 목록을 불러오는 중...' />
          ) : (
            <>
              <div className={`rounded-md border ${isPlaceholderData ? 'opacity-50' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>카테고리</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>영상 링크</TableHead>
                      <TableHead>정렬순서</TableHead>
                      <TableHead>활성화</TableHead>
                      <TableHead>썸네일</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <Badge variant='secondary'>{getLocalizedText(video.category.name)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[200px] truncate font-medium'>
                            {getLocalizedText(video.title)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[300px] truncate'>
                            {video.description ? getLocalizedText(video.description) : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getLocalizedText(video.videoUrl) ? (
                            <a
                              href={getLocalizedText(video.videoUrl)}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              링크
                            </a>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </TableCell>
                        <TableCell>{video.order ?? '-'}</TableCell>
                        <TableCell>
                          <Badge variant={video.isActive ? 'default' : 'secondary'}>
                            {video.isActive ? '활성화' : '비활성화'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <Video className='h-4 w-4' />
                            <span>{video._count.thumbnails}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedVideo(video);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                router.push(
                                  `/admin/youtube-videos/${video.id}/edit?returnTo=${encodeURIComponent(returnToListPath)}`,
                                );
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedVideo(video);
                                setDeleteDialogOpen(true);
                              }}
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
              {totalPages > 1 && (
                <div className='flex items-center justify-between pt-4'>
                  <div className='text-sm text-gray-500'>
                    {total}개 중 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}개 표시
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateURL({ page: page === 2 ? null : String(page - 1) })}
                      disabled={page === 1 || isFetching}
                    >
                      이전
                    </Button>
                    <div className='flex items-center gap-1'>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              updateURL({ page: pageNum === 1 ? null : String(pageNum) })
                            }
                            disabled={isFetching}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateURL({ page: String(page + 1) })}
                      disabled={page === totalPages || isFetching}
                    >
                      다음
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 영상 상세 다이얼로그 */}
      {selectedVideo && (
        <YoutubeVideoDetailDialog
          videoId={selectedVideo.id}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>영상 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 영상을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteVideo}
              disabled={deleteVideoMutation.isPending}
            >
              {deleteVideoMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
