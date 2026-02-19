import { Suspense } from 'react';
import { ReviewEditPage } from '@/features/review-management/ui/ReviewEditPage';
import { LoadingSpinner } from '@/shared/ui';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner text='리뷰 수정 페이지를 불러오는 중...' />}>
      <ReviewEditPage reviewId={id} />
    </Suspense>
  );
}
