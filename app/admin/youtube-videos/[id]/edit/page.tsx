import { Suspense } from 'react';
import { YoutubeVideoEditPage } from '@/features/youtube-video-management/ui/YoutubeVideoEditPage';
import { LoadingSpinner } from '@/shared/ui';

interface YoutubeVideoEditPageRouteProps {
  params: Promise<{ id: string }>;
}

export default async function YoutubeVideoEditPageRoute({
  params,
}: YoutubeVideoEditPageRouteProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner text='영상 수정 페이지를 불러오는 중...' />}>
      <YoutubeVideoEditPage videoId={id} />
    </Suspense>
  );
}
