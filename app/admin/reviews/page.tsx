'use client';

import { Suspense } from 'react';
import { ReviewManagement } from 'features/review-management';
import { LoadingSpinner } from '@/shared/ui';

export default function ReviewsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='리뷰 관리 페이지를 불러오는 중...' />}>
      <ReviewManagement />
    </Suspense>
  );
}
