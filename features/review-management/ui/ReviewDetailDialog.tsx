'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Image as ImageIcon } from 'lucide-react';
import { Prisma } from '@prisma/client';
import { LoadingSpinner } from '@/shared/ui';
import { useReviewById } from '@/lib/queries/reviews';
import Image from 'next/image';

interface ReviewDetailDialogProps {
  reviewId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetailDialog({ reviewId, open, onOpenChange }: ReviewDetailDialogProps) {
  const { data: review, isLoading } = useReviewById(reviewId, open);

  // 평점 표시
  const renderRating = (rating: number) => {
    return (
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className='ml-2 text-lg font-medium'>({rating}점)</span>
      </div>
    );
  };

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
          <LoadingSpinner text='리뷰 상세 정보를 불러오는 중...' />
        </DialogContent>
      </Dialog>
    );
  }

  if (!review) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>리뷰를 찾을 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 이미지를 타입별로 분류
  const beforeImages = review.reviewImages.filter((img) => img.imageType === 'BEFORE');
  const afterImages = review.reviewImages.filter((img) => img.imageType === 'AFTER');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>리뷰 상세 정보</DialogTitle>
          <DialogDescription>
            {review.user.name}님의 리뷰 • {new Date(review.createdAt).toLocaleDateString('ko-KR')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 기본 정보 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>사용자 정보</h3>
              <div className='space-y-1'>
                <div className='font-medium'>{review.user.name}</div>
                <div className='text-sm text-gray-500'>{review.user.email}</div>
              </div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>병원 정보</h3>
              <div className='font-medium'>{getLocalizedText(review.hospital.name)}</div>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>시술부위</h3>
              <Badge variant='secondary'>{getLocalizedText(review.medicalSpecialty.name)}</Badge>
            </div>
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>평점</h3>
              {renderRating(review.rating)}
            </div>
          </div>

          {/* 고민부위 */}
          {review.concerns && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>고민부위</h3>
              <div className='rounded-lg bg-gray-50 p-3'>
                <div className='font-medium'>{review.concerns}</div>
              </div>
            </div>
          )}

          {/* 제목 */}
          {review.title && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>제목</h3>
              <div className='rounded-lg bg-gray-50 p-3'>
                <div className='font-medium'>{getLocalizedText(review.title)}</div>
              </div>
            </div>
          )}

          {/* 리뷰 내용 */}
          {review.content && (
            <div>
              <h3 className='mb-2 text-sm font-medium text-gray-500'>리뷰 내용</h3>
              <div className='rounded-lg bg-gray-50 p-4'>
                <div className='whitespace-pre-wrap'>{getLocalizedText(review.content)}</div>
              </div>
            </div>
          )}

          {/* 추천 여부 */}
          <div>
            <h3 className='mb-2 text-sm font-medium text-gray-500'>추천 여부</h3>
            <Badge variant={review.isRecommended ? 'default' : 'secondary'}>
              {review.isRecommended ? '추천' : '비추천'}
            </Badge>
          </div>

          {/* 이미지 섹션 */}
          {(beforeImages.length > 0 || afterImages.length > 0) && (
            <div>
              <h3 className='mb-4 text-sm font-medium text-gray-500'>리뷰 이미지</h3>

              <div className='space-y-6'>
                {/* BEFORE 이미지 */}
                {beforeImages.length > 0 && (
                  <div>
                    <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                      <ImageIcon className='h-4 w-4' />
                      시술 전 ({beforeImages.length}개)
                    </h4>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
                      {beforeImages.map((image) => (
                        <div key={image.id} className='relative aspect-square'>
                          <Image
                            src={image.imageUrl}
                            alt={image.alt || '시술 전 이미지'}
                            fill
                            className='rounded-lg object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AFTER 이미지 */}
                {afterImages.length > 0 && (
                  <div>
                    <h4 className='mb-3 flex items-center gap-2 text-sm font-medium'>
                      <ImageIcon className='h-4 w-4' />
                      시술 후 ({afterImages.length}개)
                    </h4>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
                      {afterImages.map((image) => (
                        <div key={image.id} className='relative aspect-square'>
                          <Image
                            src={image.imageUrl}
                            alt={image.alt || '시술 후 이미지'}
                            fill
                            className='rounded-lg object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 메타데이터 */}
          <div className='border-t pt-4'>
            <div className='grid grid-cols-1 gap-2 text-sm text-gray-500 md:grid-cols-3'>
              <div>조회수: {review.viewCount}</div>
              <div>좋아요: {review.likeCount}</div>
              <div>수정일: {new Date(review.updatedAt).toLocaleDateString('ko-KR')}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
