'use client';

import { Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  type EventBannerWithImages,
  type MultilingualTitle,
  BANNER_TYPE_LABELS,
} from '@/features/banner-management/api';
import { BannerImageCount } from './BannerImageCount';
import { BannerImagePreviewPopover } from './BannerImagePreviewPopover';

interface BannerTableRowProps {
  banner: EventBannerWithImages;
  bannerType: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ko-KR');
}

export function BannerTableRow({
  banner,
  bannerType,
  onEdit,
  onDelete,
  isDeleting = false,
}: BannerTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className='space-y-1'>
          <div className='font-medium'>
            {(banner.title as MultilingualTitle)?.ko || '제목 없음'}
          </div>
          <div className='text-muted-foreground text-sm'>
            {(banner.title as MultilingualTitle)?.en || 'No title'} /{' '}
            {(banner.title as MultilingualTitle)?.th || 'ไม่มีชื่อ'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className='flex items-center space-x-2'>
          <BannerImageCount banner={banner} />
          <BannerImagePreviewPopover banner={banner} />
        </div>
      </TableCell>
      <TableCell>
        {banner.linkUrl ? (
          <div className='max-w-[120px] truncate text-sm' title={banner.linkUrl}>
            {banner.linkUrl}
          </div>
        ) : (
          <span className='text-muted-foreground text-sm'>-</span>
        )}
      </TableCell>
      <TableCell>
        {banner.type ? (
          <Badge variant='secondary'>{BANNER_TYPE_LABELS[banner.type]}</Badge>
        ) : (
          <span className='text-muted-foreground text-sm'>-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant='outline'>{banner.order}</Badge>
      </TableCell>
      <TableCell>
        <div className='space-y-1'>
          <div className='text-sm'>
            <Calendar className='mr-1 inline h-3 w-3' />
            {formatDate(banner.startDate)}
          </div>
          {banner.endDate && (
            <div className='text-muted-foreground text-sm'>~ {formatDate(banner.endDate)}</div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={banner.isActive ? 'default' : 'secondary'}>
          {banner.isActive ? '활성' : '비활성'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className='text-muted-foreground text-sm'>{formatDate(banner.createdAt)}</div>
      </TableCell>
      <TableCell className='text-right'>
        <div className='flex items-center justify-end space-x-2'>
          <Button variant='outline' size='sm' onClick={() => onEdit(banner.id)}>
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => onDelete(banner.id)}
            disabled={isDeleting}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
