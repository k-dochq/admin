import { Suspense } from 'react';
import { YoutubeVideoAddPage } from '@/features/youtube-video-management/ui/YoutubeVideoAddPage';
import { LoadingSpinner } from '@/shared/ui';

export default function YoutubeVideoAddPageRoute() {
  return (
    <Suspense fallback={<LoadingSpinner text='영상 추가 페이지를 불러오는 중...' />}>
      <YoutubeVideoAddPage />
    </Suspense>
  );
}
