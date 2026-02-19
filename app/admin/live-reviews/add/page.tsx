'use client';

import { Suspense } from 'react';
import { LiveReviewAddPage } from '@/features/live-review-management';
import { LoadingSpinner } from '@/shared/ui';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner text='생생후기 추가 페이지를 불러오는 중...' />}>
      <LiveReviewAddPage />
    </Suspense>
  );
}
