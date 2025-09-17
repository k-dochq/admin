'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Trash2, Edit, Eye, Star, FileImage } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { useReviews, useDeleteReview } from '@/lib/queries/reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { ReviewEditDialog } from './ReviewEditDialog';
import { ReviewDetailDialog } from './ReviewDetailDialog';
import type { ReviewForList } from '../api/entities/types';

export function ReviewManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hospitalId, setHospitalId] = useState<string>('all');
  const [medicalSpecialtyId, setMedicalSpecialtyId] = useState<string>('all');
  const [rating, setRating] = useState<string>('all');
  const [isRecommended, setIsRecommended] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<ReviewForList | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const limit = 10;

  // 데이터 조회
  const {
    data: reviewsData,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useReviews({
    page,
    limit,
    search: search || undefined,
    hospitalId: hospitalId === 'all' ? undefined : hospitalId,
    medicalSpecialtyId: medicalSpecialtyId === 'all' ? undefined : medicalSpecialtyId,
    rating: rating === 'all' ? undefined : parseInt(rating),
    isRecommended:
      isRecommended === 'all'
        ? undefined
        : isRecommended === 'true'
          ? true
          : isRecommended === 'false'
            ? false
            : undefined,
  });

  const { data: hospitalsData } = useHospitals({ limit: 100 });
  const { data: medicalSpecialties } = useMedicalSpecialties();

  const deleteReviewMutation = useDeleteReview();

  // 필터 초기화
  const handleResetFilters = () => {
    setSearch('');
    setHospitalId('all');
    setMedicalSpecialtyId('all');
    setRating('all');
    setIsRecommended('all');
    setPage(1);
  };

  // 리뷰 삭제
  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await deleteReviewMutation.mutateAsync(selectedReview.id);
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  // 평점 표시
  const renderRating = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className='ml-1 text-sm text-gray-600'>({rating})</span>
      </div>
    );
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

  const reviews = reviewsData?.reviews || [];
  const total = reviewsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>리뷰 관리</h1>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
            <div>
              <Input
                placeholder='검색 (사용자명, 병원명, 고민부위)'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder='병원 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 병원</SelectItem>
                  {hospitalsData?.hospitals.map((hospital) => (
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
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder='평점' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 평점</SelectItem>
                  <SelectItem value='5'>5점</SelectItem>
                  <SelectItem value='4'>4점</SelectItem>
                  <SelectItem value='3'>3점</SelectItem>
                  <SelectItem value='2'>2점</SelectItem>
                  <SelectItem value='1'>1점</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={isRecommended} onValueChange={setIsRecommended}>
                <SelectTrigger>
                  <SelectValue placeholder='추천 여부' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  <SelectItem value='true'>추천</SelectItem>
                  <SelectItem value='false'>비추천</SelectItem>
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

      {/* 리뷰 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>리뷰 목록 ({total}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !isPlaceholderData ? (
            <LoadingSpinner text='리뷰 목록을 불러오는 중...' />
          ) : (
            <>
              <div className={`rounded-md border ${isPlaceholderData ? 'opacity-50' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>사용자</TableHead>
                      <TableHead>병원</TableHead>
                      <TableHead>시술부위</TableHead>
                      <TableHead>평점</TableHead>
                      <TableHead>고민부위</TableHead>
                      <TableHead>추천</TableHead>
                      <TableHead>이미지</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{review.user.name}</div>
                            <div className='text-sm text-gray-500'>{review.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>
                            {getLocalizedText(review.hospital.name)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {getLocalizedText(review.medicalSpecialty.name)}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderRating(review.rating)}</TableCell>
                        <TableCell>
                          <div className='max-w-[200px] truncate'>
                            {getLocalizedText(review.concernsMultilingual) || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={review.isRecommended ? 'default' : 'secondary'}>
                            {review.isRecommended ? '추천' : '비추천'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <FileImage className='h-4 w-4' />
                            <span>{review._count.reviewImages}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedReview(review);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedReview(review);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedReview(review);
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

      {/* 리뷰 상세 다이얼로그 */}
      {selectedReview && (
        <ReviewDetailDialog
          reviewId={selectedReview.id}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      {/* 리뷰 수정 다이얼로그 */}
      {selectedReview && (
        <ReviewEditDialog
          reviewId={selectedReview.id}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedReview(null);
          }}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteReview}
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
