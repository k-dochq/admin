'use client';

import { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { LoadingSpinner } from '@/shared/ui';
import { useDeleteBanner } from '@/lib/mutations/banner-mutations';
import { type GetBannersResponse } from '@/features/banner-management/api';
import { useRouter } from 'next/navigation';
import { type EventBannerType } from '@prisma/client';
import { BannerTableHeader } from './BannerTableHeader';
import { BannerTableRow } from './BannerTableRow';
import { BannerTableEmpty } from './BannerTableEmpty';
import { BannerPagination } from './BannerPagination';
import { BannerDeleteDialog } from './BannerDeleteDialog';

interface BannerTableProps {
  data?: GetBannersResponse;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  bannerType: EventBannerType;
  onPageChange: (page: number) => void;
  onFilterChange: (key: string, value: boolean | undefined) => void;
}

export function BannerTable({
  data,
  isLoading,
  isFetching,
  page,
  bannerType,
  onPageChange,
  onFilterChange,
}: BannerTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  const deleteMutation = useDeleteBanner();

  const handleEdit = (id: string) => {
    const typePath = bannerType.toLowerCase();
    router.push(`/admin/banners/${typePath}/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete) {
      await deleteMutation.mutateAsync(bannerToDelete);
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text='배너를 불러오는 중...' />;
  }

  if (!data || data.banners.length === 0) {
    return <BannerTableEmpty />;
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <BannerTableHeader />
          <TableBody>
            {data.banners.map((banner) => (
              <BannerTableRow
                key={banner.id}
                banner={banner}
                bannerType={bannerType}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <BannerPagination
        total={data.total}
        page={page}
        limit={data.limit}
        totalPages={data.totalPages}
        onPageChange={onPageChange}
      />

      <BannerDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
