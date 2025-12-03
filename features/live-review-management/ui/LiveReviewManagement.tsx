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
import { Trash2, Edit, Eye, FileImage, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useLiveReviews, useDeleteLiveReview } from '@/lib/queries/live-reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useRouter } from 'next/navigation';
import { LiveReviewDetailDialog } from './LiveReviewDetailDialog';
import type { LiveReviewForList } from '../api/entities/types';

export function LiveReviewManagement() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [hospitalId, setHospitalId] = useState<string>('all');
  const [medicalSpecialtyId, setMedicalSpecialtyId] = useState<string>('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [selectedLiveReview, setSelectedLiveReview] = useState<LiveReviewForList | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const limit = 10;

  // 데이터 조회
  const {
    data: liveReviewsData,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useLiveReviews({
    page,
    limit,
    hospitalId: hospitalId === 'all' ? undefined : hospitalId,
    medicalSpecialtyId: medicalSpecialtyId === 'all' ? undefined : medicalSpecialtyId,
    isActive:
      isActive === 'all'
        ? undefined
        : isActive === 'true'
          ? true
          : isActive === 'false'
            ? false
            : undefined,
  });

  const { data: hospitalsData } = useHospitals({ limit: 100 });
  const { data: medicalSpecialties } = useMedicalSpecialties();

  const deleteLiveReviewMutation = useDeleteLiveReview();

  // 필터 초기화
  const handleResetFilters = () => {
    setHospitalId('all');
    setMedicalSpecialtyId('all');
    setIsActive('all');
    setPage(1);
  };

  // 생생후기 삭제
  const handleDeleteLiveReview = async () => {
    if (!selectedLiveReview) return;

    try {
      await deleteLiveReviewMutation.mutateAsync(selectedLiveReview.id);
      setDeleteDialogOpen(false);
      setSelectedLiveReview(null);
    } catch (error) {
      console.error('Failed to delete live review:', error);
    }
  };

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
      );
    }
    return '';
  };

  const liveReviews = liveReviewsData?.liveReviews || [];
  const total = liveReviewsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>생생후기 관리</h1>
        <Button
          onClick={() => router.push('/admin/live-reviews/add')}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          생생후기 추가
        </Button>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder='병원 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 병원</SelectItem>
                  {hospitalsData?.hospitals
                    .sort((a, b) => {
                      const nameA = getLocalizedText(a.name);
                      const nameB = getLocalizedText(b.name);
                      return nameA.localeCompare(nameB, 'ko-KR');
                    })
                    .map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {getLocalizedText(hospital.name)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={medicalSpecialtyId} onValueChange={setMedicalSpecialtyId}>
                <SelectTrigger>
                  <SelectValue placeholder='시술부위 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 시술부위</SelectItem>
                  {medicalSpecialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {getLocalizedText(specialty.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={isActive} onValueChange={setIsActive}>
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

      {/* 생생후기 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>생생후기 목록 ({total}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isPlaceholderData ? (
            <LoadingSpinner text='생생후기 목록을 불러오는 중...' />
          ) : (
            <>
              <div className={`rounded-md border ${isPlaceholderData ? 'opacity-50' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>병원</TableHead>
                      <TableHead>시술부위</TableHead>
                      <TableHead>내용</TableHead>
                      <TableHead>상세링크</TableHead>
                      <TableHead>정렬순서</TableHead>
                      <TableHead>활성화</TableHead>
                      <TableHead>이미지</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveReviews.map((liveReview) => (
                      <TableRow key={liveReview.id}>
                        <TableCell>
                          <div className='font-medium'>
                            {getLocalizedText(liveReview.hospital.name)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {getLocalizedText(liveReview.medicalSpecialty.name)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[300px] truncate'>
                            {getLocalizedText(liveReview.content)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {liveReview.detailLink ? (
                            <a
                              href={liveReview.detailLink}
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
                        <TableCell>{liveReview.order ?? '-'}</TableCell>
                        <TableCell>
                          <Badge variant={liveReview.isActive ? 'default' : 'secondary'}>
                            {liveReview.isActive ? '활성화' : '비활성화'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <FileImage className='h-4 w-4' />
                            <span>{liveReview._count.liveReviewImages}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(liveReview.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedLiveReview(liveReview);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                router.push(`/admin/live-reviews/${liveReview.id}/edit`);
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedLiveReview(liveReview);
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
                      onClick={() => setPage(page - 1)}
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
                            onClick={() => setPage(pageNum)}
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
                      onClick={() => setPage(page + 1)}
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

      {/* 생생후기 상세 다이얼로그 */}
      {selectedLiveReview && (
        <LiveReviewDetailDialog
          liveReviewId={selectedLiveReview.id}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>생생후기 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 생생후기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteLiveReview}
              disabled={deleteLiveReviewMutation.isPending}
            >
              {deleteLiveReviewMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
