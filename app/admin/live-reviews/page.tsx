'use client';

import { Suspense } from 'react';
import { LiveReviewManagement } from 'features/live-review-management';
import { LoadingSpinner } from '@/shared/ui';

export default function LiveReviewsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='생생후기 목록을 불러오는 중...' />}>
      <LiveReviewManagement />
    </Suspense>
  );
}
