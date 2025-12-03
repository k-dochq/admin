'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image as ImageIcon } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { LoadingSpinner } from '@/shared/ui';
import { useLiveReviewById } from '@/lib/queries/live-reviews';
import Image from 'next/image';

interface LiveReviewDetailDialogProps {
  liveReviewId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LiveReviewDetailDialog({
  liveReviewId,
  open,
  onOpenChange,
}: LiveReviewDetailDialogProps) {
  const { data: liveReview, isLoading } = useLiveReviewById(liveReviewId, open);

  // 다국어 텍스트 추출
  const getLocalizedText = (jsonText: Prisma.JsonValue | null | undefined): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (
        (textObj.ko_KR as string) || (textObj.en_US as string) || (textObj.th_TH as string) || ''
      );
    }
    return '';
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
          <LoadingSpinner text='생생후기 상세 정보를 불러오는 중...' />
        </DialogContent>
      </Dialog>
    );
  }

  if (!liveReview) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>생생후기를 찾을 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>생생후기 상세 정보</DialogTitle>
          <DialogDescription>
            {new Date(liveReview.createdAt).toLocaleDateString('ko-KR')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 기본 정보 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>병원 정보</h3>
              <div className='font-medium'>{getLocalizedText(liveReview.hospital.name)}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>시술부위</h3>
              <Badge variant='secondary'>
                {getLocalizedText(liveReview.medicalSpecialty.name)}
              </Badge>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>정렬 순서</h3>
              <div className='font-medium'>{liveReview.order ?? '-'}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>활성화 여부</h3>
              <Badge variant={liveReview.isActive ? 'default' : 'secondary'}>
                {liveReview.isActive ? '활성화' : '비활성화'}
              </Badge>
            </div>
            {liveReview.detailLink && (
              <div className='md:col-span-2'>
                <h3 className='mb-2 text-sm font-medium text-gray-500'>상세 링크</h3>
                <a
                  href={liveReview.detailLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline'
                >
                  {liveReview.detailLink}
                </a>
              </div>
            )}
          </div>

          {/* 생생후기 내용 */}
          {liveReview.content && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>생생후기 내용</h3>
              <div className='rounded-lg bg-gray-50 p-4'>
                <div className='whitespace-pre-wrap'>{getLocalizedText(liveReview.content)}</div>
              </div>
            </div>
          )}

          {/* 이미지 섹션 */}
          {liveReview.liveReviewImages.length > 0 && (
            <div>
              <h3 className='mb-4 flex items-center gap-2 text-sm font-medium text-gray-500'>
                <ImageIcon className='h-4 w-4' />
                생생후기 이미지 ({liveReview.liveReviewImages.length}개)
              </h3>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
                {liveReview.liveReviewImages.map((image) => (
                  <div key={image.id} className='relative aspect-square'>
                    <Image
                      src={image.imageUrl}
                      alt={image.alt || '생생후기 이미지'}
                      fill
                      className='rounded-lg object-cover'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메타데이터 */}
          <div className='border-t pt-4'>
            <div className='grid grid-cols-1 gap-2 text-sm text-gray-500 md:grid-cols-2'>
              <div>작성일: {new Date(liveReview.createdAt).toLocaleDateString('ko-KR')}</div>
              <div>수정일: {new Date(liveReview.updatedAt).toLocaleDateString('ko-KR')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
