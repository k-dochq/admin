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
import { Trash2, Edit, Eye, Star, FileImage, Plus, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useReviews,
  useDeleteReview,
  useBatchUpdateReviews,
  useBatchUpdateReviewsByHospital,
} from '@/lib/queries/reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import { useHospitals } from '@/lib/queries/hospitals';
import { useRouter } from 'next/navigation';
import { sortHospitalsByName } from 'shared/lib';
import { ReviewDetailDialog } from './ReviewDetailDialog';
import { ReviewBulkActions } from './ReviewBulkActions';
import type { ReviewForList } from '../api/entities/types';
import type { CheckedState } from '@radix-ui/react-checkbox';

export function ReviewManagement() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [hospitalId, setHospitalId] = useState<string>('all');
  const [medicalSpecialtyId, setMedicalSpecialtyId] = useState<string>('all');
  const [rating, setRating] = useState<string>('all');
  const [isRecommended, setIsRecommended] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<ReviewForList | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [hospitalBulkDialogOpen, setHospitalBulkDialogOpen] = useState(false);
  const [hospitalBulkIsActive, setHospitalBulkIsActive] = useState<boolean>(false);

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
    userType: userType === 'all' ? undefined : (userType as 'real' | 'admin'),
  });

  const { data: hospitalsData } = useHospitals({ limit: 100 });
  const { data: medicalSpecialties } = useMedicalSpecialties();

  const deleteReviewMutation = useDeleteReview();
  const batchUpdateReviewsMutation = useBatchUpdateReviews();
  const batchUpdateReviewsByHospitalMutation = useBatchUpdateReviewsByHospital();

  // 검색 실행
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setHospitalId('all');
    setMedicalSpecialtyId('all');
    setRating('all');
    setIsRecommended('all');
    setUserType('all');
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

  // 리뷰 선택/해제
  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, reviewId]);
    } else {
      setSelectedReviews((prev) => prev.filter((id) => id !== reviewId));
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((review) => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  // 일괄 업데이트
  const handleBulkUpdate = async (isActive: boolean) => {
    if (selectedReviews.length === 0) return;

    try {
      await batchUpdateReviewsMutation.mutateAsync({
        reviewIds: selectedReviews,
        isActive,
      });
      setSelectedReviews([]);
    } catch (error) {
      console.error('Failed to batch update reviews:', error);
    }
  };

  // 병원별 일괄 업데이트
  const handleHospitalBulkUpdate = async () => {
    if (hospitalId === 'all') return;

    try {
      await batchUpdateReviewsByHospitalMutation.mutateAsync({
        hospitalId,
        isActive: hospitalBulkIsActive,
      });
      setHospitalBulkDialogOpen(false);
    } catch (error) {
      console.error('Failed to batch update reviews by hospital:', error);
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
        <Button
          onClick={() => router.push('/admin/reviews/add')}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          리뷰 추가
        </Button>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7'>
            <div className='flex gap-2'>
              <Input
                placeholder='검색 (사용자명, 병원명)'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className='flex-1'
              />
              <Button onClick={handleSearch} variant='default'>
                검색
              </Button>
            </div>
            <div className='flex gap-2'>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger>
                  <SelectValue placeholder='병원 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체 병원</SelectItem>
                  {hospitalsData?.hospitals
                    ? sortHospitalsByName(hospitalsData.hospitals).map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {getLocalizedText(hospital.name)}
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>
              {hospitalId !== 'all' && (
                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setHospitalBulkIsActive(true);
                      setHospitalBulkDialogOpen(true);
                    }}
                  >
                    <Eye className='mr-1 h-3 w-3' />
                    활성화
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setHospitalBulkIsActive(false);
                      setHospitalBulkDialogOpen(true);
                    }}
                  >
                    <EyeOff className='mr-1 h-3 w-3' />
                    숨김
                  </Button>
                </div>
              )}
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
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue placeholder='사용자 타입' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  <SelectItem value='real'>실제 사용자</SelectItem>
                  <SelectItem value='admin'>관리자 생성</SelectItem>
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
              <ReviewBulkActions
                selectedCount={selectedReviews.length}
                onBulkUpdate={handleBulkUpdate}
                onClearSelection={() => setSelectedReviews([])}
                isProcessing={batchUpdateReviewsMutation.isPending}
              />
              <div className={`rounded-md border ${isPlaceholderData ? 'opacity-50' : ''}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <Checkbox
                          checked={selectedReviews.length === reviews.length && reviews.length > 0}
                          onCheckedChange={(value: CheckedState) => handleSelectAll(value === true)}
                        />
                      </TableHead>
                      <TableHead>사용자</TableHead>
                      <TableHead>병원</TableHead>
                      <TableHead>시술부위</TableHead>
                      <TableHead>평점</TableHead>
                      <TableHead>고민부위</TableHead>
                      <TableHead>추천</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>이미지</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => {
                      const isSelected = selectedReviews.includes(review.id);
                      const isActive = review.isActive ?? true;
                      return (
                        <TableRow
                          key={review.id}
                          className={!isActive ? 'bg-gray-50 opacity-60' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(value: CheckedState) =>
                                handleSelectReview(review.id, value === true)
                              }
                            />
                          </TableCell>
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
                            <Badge variant={isActive ? 'default' : 'secondary'}>
                              {isActive ? (
                                <div className='flex items-center gap-1'>
                                  <Eye className='h-3 w-3' />
                                  활성화
                                </div>
                              ) : (
                                <div className='flex items-center gap-1'>
                                  <EyeOff className='h-3 w-3' />
                                  숨김
                                </div>
                              )}
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
                                  router.push(`/admin/reviews/${review.id}/edit`);
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
                      );
                    })}
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

      {/* 병원별 일괄 처리 확인 다이얼로그 */}
      <Dialog open={hospitalBulkDialogOpen} onOpenChange={setHospitalBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>병원별 리뷰 일괄 처리</DialogTitle>
            <DialogDescription>
              선택한 병원의 모든 리뷰를 {hospitalBulkIsActive ? '활성화' : '숨김'} 처리하시겠습니까?
              <br />이 작업은 되돌릴 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setHospitalBulkDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant='default'
              onClick={handleHospitalBulkUpdate}
              disabled={batchUpdateReviewsByHospitalMutation.isPending}
            >
              {batchUpdateReviewsByHospitalMutation.isPending
                ? '처리 중...'
                : hospitalBulkIsActive
                  ? '활성화'
                  : '숨김'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
