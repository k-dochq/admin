'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/shared/ui';
import { ReviewBulkActions } from './ReviewBulkActions';
import { ReviewTableRow } from './ReviewTableRow';
import { ReviewPagination } from './ReviewPagination';
import type { ReviewForList } from '../api/entities/types';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface ReviewTableProps {
  reviews: ReviewForList[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  selectedReviews: string[];
  onSelectReview: (reviewId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkUpdate: (isActive: boolean) => void;
  onClearSelection: () => void;
  onViewReview: (review: ReviewForList) => void;
  onDeleteReview: (review: ReviewForList) => void;
  isProcessing: boolean;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function ReviewTable({
  reviews,
  isLoading,
  isPlaceholderData,
  selectedReviews,
  onSelectReview,
  onSelectAll,
  onBulkUpdate,
  onClearSelection,
  onViewReview,
  onDeleteReview,
  isProcessing,
  page,
  limit,
  hasNextPage,
  hasPrevPage,
  isFetching,
  onPageChange,
}: ReviewTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>리뷰 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !isPlaceholderData ? (
          <LoadingSpinner text='리뷰 목록을 불러오는 중...' />
        ) : (
          <>
            <ReviewBulkActions
              selectedCount={selectedReviews.length}
              onBulkUpdate={onBulkUpdate}
              onClearSelection={onClearSelection}
              isProcessing={isProcessing}
            />
            <div className={`rounded-md border ${isPlaceholderData ? 'opacity-50' : ''}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>
                      <Checkbox
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onCheckedChange={(value: CheckedState) => onSelectAll(value === true)}
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
                  {reviews.map((review) => (
                    <ReviewTableRow
                      key={review.id}
                      review={review}
                      isSelected={selectedReviews.includes(review.id)}
                      onSelect={onSelectReview}
                      onView={onViewReview}
                      onDelete={onDeleteReview}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <ReviewPagination
              page={page}
              limit={limit}
              currentCount={reviews.length}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              isFetching={isFetching}
              onPageChange={onPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
