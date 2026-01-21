'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Eye, FileImage, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getLocalizedText } from '../lib/utils/review-utils';
import { getReviewUserTypeFromEmail, getReviewUserTypeLabel } from '../lib/user-type';
import type { ReviewForList } from '../api/entities/types';
import type { CheckedState } from '@radix-ui/react-checkbox';

interface ReviewTableRowProps {
  review: ReviewForList;
  isSelected: boolean;
  onSelect: (reviewId: string, checked: boolean) => void;
  onView: (review: ReviewForList) => void;
  onDelete: (review: ReviewForList) => void;
}

export function ReviewTableRow({
  review,
  isSelected,
  onSelect,
  onView,
  onDelete,
}: ReviewTableRowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = review.isActive ?? true;
  const userType = getReviewUserTypeFromEmail(review.user.email);
  const userTypeLabel = getReviewUserTypeLabel(userType);

  const handleEdit = () => {
    const currentParams = searchParams.toString();
    const returnTo = currentParams ? `/admin/reviews?${currentParams}` : '/admin/reviews';
    router.push(`/admin/reviews/${review.id}/edit?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <TableRow className={!isActive ? 'bg-gray-50 opacity-60' : ''}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(value: CheckedState) => onSelect(review.id, value === true)}
        />
      </TableCell>
      <TableCell className='whitespace-nowrap'>
        <Badge variant={userType === 'admin' ? 'secondary' : 'default'}>{userTypeLabel}</Badge>
      </TableCell>
      <TableCell>
        <div>
          <div className='font-medium'>{review.user.name}</div>
          <div className='text-sm text-gray-500'>{review.user.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className='font-medium'>{getLocalizedText(review.hospital.name)}</div>
      </TableCell>
      <TableCell>
        <Badge variant='secondary'>{getLocalizedText(review.medicalSpecialty.name)}</Badge>
      </TableCell>
      <TableCell>
        <div className='max-w-[200px] truncate'>
          {getLocalizedText(review.concernsMultilingual) || '-'}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={review.isRecommended ? 'default' : 'secondary'}>
          {review.isRecommended ? '추천' : '비추천'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? (
            <div className='flex items-center gap-1'>
              <Eye className='h-3 w-3' />
              활성화
            </div>
          ) : (
            <div className='flex items-center gap-1'>
              <EyeOff className='h-3 w-3' />
              숨김
            </div>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-1'>
          <FileImage className='h-4 w-4' />
          <span>{review._count.reviewImages}</span>
        </div>
      </TableCell>
      <TableCell>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</TableCell>
      <TableCell>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => onView(review)}>
            <Eye className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm' onClick={handleEdit}>
            <Edit className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm' onClick={() => onDelete(review)}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
