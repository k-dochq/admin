'use client';

import { Suspense } from 'react';
import { YoutubeVideoManagement } from '@/features/youtube-video-management/ui/YoutubeVideoManagement';
import { LoadingSpinner } from '@/shared/ui';

export default function YoutubeVideosPage() {
  return (
    <Suspense fallback={<LoadingSpinner text='영상 목록을 불러오는 중...' />}>
      <YoutubeVideoManagement />
    </Suspense>
  );
}
