import { Suspense } from 'react';
import { LiveReviewEditPage } from '@/features/live-review-management';
import { LoadingSpinner } from '@/shared/ui';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner text='생생후기 수정 페이지를 불러오는 중...' />}>
      <LiveReviewEditPage liveReviewId={id} />
    </Suspense>
  );
}
