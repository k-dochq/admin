'use client';

import { Prisma } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/shared/ui';
import { useYoutubeVideoById } from '@/lib/queries/youtube-videos';

interface YoutubeVideoDetailDialogProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YoutubeVideoDetailDialog({
  videoId,
  open,
  onOpenChange,
}: YoutubeVideoDetailDialogProps) {
  const { data: video, isLoading } = useYoutubeVideoById(videoId, open);

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (textObj.ko as string) || (textObj.en as string) || (textObj.th as string) || '';
    }
    return '';
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <LoadingSpinner text='영상 정보를 불러오는 중...' />
        </DialogContent>
      </Dialog>
    );
  }

  if (!video) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className='py-8 text-center'>영상을 찾을 수 없습니다.</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>영상 상세 정보</DialogTitle>
          <DialogDescription>영상의 상세 정보를 확인합니다.</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 기본 정보 */}
          <div className='space-y-4'>
            <div>
              <h3 className='mb-1 text-sm font-medium text-gray-500'>카테고리</h3>
              <Badge variant='secondary'>{getLocalizedText(video.category.name)}</Badge>
            </div>

            <div>
              <h3 className='mb-1 text-sm font-medium text-gray-500'>제목</h3>
              <div className='text-base'>
                <div>
                  <span className='font-medium'>한국어:</span> {getLocalizedText(video.title)}
                </div>
                {video.title && typeof video.title === 'object' && (
                  <>
                    {(video.title as Record<string, unknown>).en && (
                      <div>
                        <span className='font-medium'>English:</span>{' '}
                        {(video.title as Record<string, unknown>).en as string}
                      </div>
                    )}
                    {(video.title as Record<string, unknown>).th && (
                      <div>
                        <span className='font-medium'>ไทย:</span>{' '}
                        {(video.title as Record<string, unknown>).th as string}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {video.description && (
              <div>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>설명</h3>
                <div className='text-base'>
                  <div>
                    <span className='font-medium'>한국어:</span>{' '}
                    {getLocalizedText(video.description)}
                  </div>
                  {video.description && typeof video.description === 'object' && (
                    <>
                      {(video.description as Record<string, unknown>).en && (
                        <div>
                          <span className='font-medium'>English:</span>{' '}
                          {(video.description as Record<string, unknown>).en as string}
                        </div>
                      )}
                      {(video.description as Record<string, unknown>).th && (
                        <div>
                          <span className='font-medium'>ไทย:</span>{' '}
                          {(video.description as Record<string, unknown>).th as string}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className='mb-1 text-sm font-medium text-gray-500'>영상 링크</h3>
              <div className='text-base'>
                <div>
                  <span className='font-medium'>한국어:</span>{' '}
                  {getLocalizedText(video.videoUrl) ? (
                    <a
                      href={getLocalizedText(video.videoUrl)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {getLocalizedText(video.videoUrl)}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                {video.videoUrl && typeof video.videoUrl === 'object' && (
                  <>
                    {(video.videoUrl as Record<string, unknown>).en && (
                      <div>
                        <span className='font-medium'>English:</span>{' '}
                        <a
                          href={(video.videoUrl as Record<string, unknown>).en as string}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {(video.videoUrl as Record<string, unknown>).en as string}
                        </a>
                      </div>
                    )}
                    {(video.videoUrl as Record<string, unknown>).th && (
                      <div>
                        <span className='font-medium'>ไทย:</span>{' '}
                        <a
                          href={(video.videoUrl as Record<string, unknown>).th as string}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {(video.videoUrl as Record<string, unknown>).th as string}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>정렬순서</h3>
                <div className='text-base'>{video.order ?? '-'}</div>
              </div>
              <div>
                <h3 className='mb-1 text-sm font-medium text-gray-500'>활성화</h3>
                <Badge variant={video.isActive ? 'default' : 'secondary'}>
                  {video.isActive ? '활성화' : '비활성화'}
                </Badge>
              </div>
            </div>
          </div>

          {/* 썸네일 */}
          {video.thumbnails && video.thumbnails.length > 0 && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>썸네일</h3>
              <div className='grid grid-cols-3 gap-4'>
                {video.thumbnails.map(
                  (thumbnail: {
                    id: string;
                    locale: string;
                    imageUrl: string;
                    alt: string | null;
                  }) => (
                    <div key={thumbnail.id} className='space-y-2'>
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                        <img
                          src={thumbnail.imageUrl}
                          alt={thumbnail.alt || `Thumbnail ${thumbnail.locale}`}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <div className='text-center text-sm'>
                        <Badge variant='outline'>{thumbnail.locale.toUpperCase()}</Badge>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* 작성일 */}
          <div>
            <h3 className='mb-1 text-sm font-medium text-gray-500'>작성일</h3>
            <div className='text-base'>{new Date(video.createdAt).toLocaleString('ko-KR')}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
