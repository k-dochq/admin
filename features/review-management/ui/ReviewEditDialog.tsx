'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Prisma } from '@prisma/client';
import { LoadingSpinner } from '@/shared/ui';
import { useReviewById, useUpdateReview } from '@/lib/queries/reviews';
import { useMedicalSpecialties } from '@/lib/queries/medical-specialties';
import type { UpdateReviewRequest } from '../api/entities/types';

interface ReviewEditDialogProps {
  reviewId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReviewEditDialog({
  reviewId,
  open,
  onOpenChange,
  onSuccess,
}: ReviewEditDialogProps) {
  const { data: review, isLoading } = useReviewById(reviewId, open);
  const { data: medicalSpecialties } = useMedicalSpecialties();
  const updateReviewMutation = useUpdateReview();

  const [formData, setFormData] = useState({
    rating: 5,
    titleKo: '',
    titleEn: '',
    titleTh: '',
    contentKo: '',
    contentEn: '',
    contentTh: '',
    concerns: '',
    isRecommended: true,
    medicalSpecialtyId: '',
  });

  // 다국어 텍스트 추출
  const getLocalizedText = (
    jsonText: Prisma.JsonValue | null | undefined,
    locale: string,
  ): string => {
    if (!jsonText) return '';
    if (typeof jsonText === 'string') return jsonText;
    if (typeof jsonText === 'object' && jsonText !== null && !Array.isArray(jsonText)) {
      const textObj = jsonText as Record<string, unknown>;
      return (textObj[locale] as string) || '';
    }
    return '';
  };

  // 리뷰 데이터로 폼 초기화
  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating,
        titleKo: getLocalizedText(review.title, 'ko_KR'),
        titleEn: getLocalizedText(review.title, 'en_US'),
        titleTh: getLocalizedText(review.title, 'th_TH'),
        contentKo: getLocalizedText(review.content, 'ko_KR'),
        contentEn: getLocalizedText(review.content, 'en_US'),
        contentTh: getLocalizedText(review.content, 'th_TH'),
        concerns: review.concerns || '',
        isRecommended: review.isRecommended,
        medicalSpecialtyId: review.medicalSpecialtyId,
      });
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateReviewRequest = {
      rating: formData.rating,
      title: {
        ko_KR: formData.titleKo,
        en_US: formData.titleEn,
        th_TH: formData.titleTh,
      },
      content: {
        ko_KR: formData.contentKo,
        en_US: formData.contentEn,
        th_TH: formData.contentTh,
      },
      concerns: formData.concerns || undefined,
      isRecommended: formData.isRecommended,
      medicalSpecialtyId: formData.medicalSpecialtyId,
    };

    try {
      await updateReviewMutation.mutateAsync({
        id: reviewId,
        data: updateData,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <LoadingSpinner text='리뷰 정보를 불러오는 중...' />
        </DialogContent>
      </Dialog>
    );
  }

  if (!review) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-2xl'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground'>리뷰를 찾을 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>리뷰 수정</DialogTitle>
          <DialogDescription>{review.user.name}님의 리뷰를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* 기본 정보 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='rating'>평점</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5점</SelectItem>
                  <SelectItem value='4'>4점</SelectItem>
                  <SelectItem value='3'>3점</SelectItem>
                  <SelectItem value='2'>2점</SelectItem>
                  <SelectItem value='1'>1점</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='medicalSpecialtyId'>시술부위</Label>
              <Select
                value={formData.medicalSpecialtyId}
                onValueChange={(value) => setFormData({ ...formData, medicalSpecialtyId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {medicalSpecialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {getLocalizedText(specialty.name, 'ko_KR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 고민부위 */}
          <div>
            <Label htmlFor='concerns'>고민부위</Label>
            <Input
              id='concerns'
              value={formData.concerns}
              onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
              placeholder='예: #쌍꺼풀(자연유착)'
            />
          </div>

          {/* 제목 (다국어) */}
          <div className='space-y-4'>
            <Label>제목</Label>
            <div className='space-y-3'>
              <div>
                <Label htmlFor='titleKo' className='text-sm text-gray-500'>
                  한국어
                </Label>
                <Input
                  id='titleKo'
                  value={formData.titleKo}
                  onChange={(e) => setFormData({ ...formData, titleKo: e.target.value })}
                  placeholder='한국어 제목'
                />
              </div>
              <div>
                <Label htmlFor='titleEn' className='text-sm text-gray-500'>
                  영어
                </Label>
                <Input
                  id='titleEn'
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder='English title'
                />
              </div>
              <div>
                <Label htmlFor='titleTh' className='text-sm text-gray-500'>
                  태국어
                </Label>
                <Input
                  id='titleTh'
                  value={formData.titleTh}
                  onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                  placeholder='ชื่อเรื่อง'
                />
              </div>
            </div>
          </div>

          {/* 내용 (다국어) */}
          <div className='space-y-4'>
            <Label>리뷰 내용</Label>
            <div className='space-y-3'>
              <div>
                <Label htmlFor='contentKo' className='text-sm text-gray-500'>
                  한국어
                </Label>
                <Textarea
                  id='contentKo'
                  value={formData.contentKo}
                  onChange={(e) => setFormData({ ...formData, contentKo: e.target.value })}
                  placeholder='한국어 리뷰 내용'
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor='contentEn' className='text-sm text-gray-500'>
                  영어
                </Label>
                <Textarea
                  id='contentEn'
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  placeholder='English review content'
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor='contentTh' className='text-sm text-gray-500'>
                  태국어
                </Label>
                <Textarea
                  id='contentTh'
                  value={formData.contentTh}
                  onChange={(e) => setFormData({ ...formData, contentTh: e.target.value })}
                  placeholder='เนื้อหาการรีวิว'
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* 추천 여부 */}
          <div className='flex items-center space-x-2'>
            <Switch
              id='isRecommended'
              checked={formData.isRecommended}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: checked })}
            />
            <Label htmlFor='isRecommended'>추천</Label>
          </div>

          {/* 버튼 */}
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type='submit' disabled={updateReviewMutation.isPending}>
              {updateReviewMutation.isPending ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
