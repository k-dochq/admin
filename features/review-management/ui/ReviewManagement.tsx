'use client';

import { useState, useCallback } from 'react';
import { useAdminListUrl } from '@/lib/hooks/use-admin-list-url';
import {
  useReviews,
  useDeleteReview,
  useBatchUpdateReviews,
  useBatchUpdateReviewsByHospital,
} from '@/lib/queries/reviews';
import { ReviewManagementHeader } from './ReviewManagementHeader';
import { ReviewFilters } from './ReviewFilters';
import { ReviewTable } from './ReviewTable';
import { ReviewDetailDialog } from './ReviewDetailDialog';
import { ReviewDeleteDialog } from './ReviewDeleteDialog';
import { ReviewHospitalBulkDialog } from './ReviewHospitalBulkDialog';
import type { ReviewForList } from '../api/entities/types';

export function ReviewManagement() {
  const { updateURL, returnToListPath, resetUrl, searchParams } = useAdminListUrl('reviews', {
    treatAllAsEmpty: true,
  });

  // 쿼리 파라미터에서 필터 값 읽기
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const hospitalId = searchParams.get('hospitalId') || 'all';
  const medicalSpecialtyId = searchParams.get('medicalSpecialtyId') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const isRecommended = searchParams.get('isRecommended') || 'all';
  const userType = searchParams.get('userType') || 'all';

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

  const deleteReviewMutation = useDeleteReview();
  const batchUpdateReviewsMutation = useBatchUpdateReviews();
  const batchUpdateReviewsByHospitalMutation = useBatchUpdateReviewsByHospital();

  // 필터 초기화
  const handleResetFilters = () => {
    resetUrl();
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
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const reviews = reviewsData?.reviews || [];
        setSelectedReviews(reviews.map((review) => review.id));
      } else {
        setSelectedReviews([]);
      }
    },
    [reviewsData?.reviews],
  );

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

  // 병원별 일괄 처리 다이얼로그 열기
  const handleHospitalBulkAction = (isActive: boolean) => {
    setHospitalBulkIsActive(isActive);
    setHospitalBulkDialogOpen(true);
  };

  const reviews = reviewsData?.reviews || [];
  const hasNextPage = reviewsData?.hasNextPage ?? false;
  const hasPrevPage = reviewsData?.hasPrevPage ?? page > 1;

  return (
    <div className='space-y-6'>
      <ReviewManagementHeader />

      <ReviewFilters
        onUpdateURL={updateURL}
        onResetFilters={handleResetFilters}
        hospitalId={hospitalId}
        onHospitalBulkAction={handleHospitalBulkAction}
      />

      <ReviewTable
        reviews={reviews}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        selectedReviews={selectedReviews}
        onSelectReview={handleSelectReview}
        onSelectAll={handleSelectAll}
        onBulkUpdate={handleBulkUpdate}
        onClearSelection={() => setSelectedReviews([])}
        onViewReview={(review) => {
          setSelectedReview(review);
          setDetailDialogOpen(true);
        }}
        onDeleteReview={(review) => {
          setSelectedReview(review);
          setDeleteDialogOpen(true);
        }}
        isProcessing={batchUpdateReviewsMutation.isPending}
        page={page}
        limit={limit}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        isFetching={isFetching}
        onPageChange={(newPage) =>
          updateURL({ page: newPage === 1 ? null : newPage.toString() })
        }
      />

      {selectedReview && (
        <ReviewDetailDialog
          reviewId={selectedReview.id}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}

      <ReviewDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteReview}
        isDeleting={deleteReviewMutation.isPending}
      />

      <ReviewHospitalBulkDialog
        open={hospitalBulkDialogOpen}
        onOpenChange={setHospitalBulkDialogOpen}
        isActive={hospitalBulkIsActive}
        onConfirm={handleHospitalBulkUpdate}
        isProcessing={batchUpdateReviewsByHospitalMutation.isPending}
      />
    </div>
  );
}
