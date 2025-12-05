'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Tag } from 'lucide-react';
import { HospitalCategoryManagement } from '@/features/hospital-category-management';

export function HospitalHeader() {
  const router = useRouter();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const handleAddHospital = () => {
    router.push('/admin/hospitals/add');
  };

  return (
    <>
      <div className='flex items-center justify-end gap-2'>
        <Button variant='outline' onClick={() => setCategoryDialogOpen(true)}>
          <Tag className='mr-2 h-4 w-4' />
          병원 카테고리 관리
        </Button>
        <Button onClick={handleAddHospital}>
          <Plus className='mr-2 h-4 w-4' />
          병원 추가
        </Button>
      </div>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className='max-h-[90vh] w-[95vw] !max-w-[1200px] overflow-y-auto sm:!max-w-[1200px]'>
          <DialogHeader>
            <DialogTitle>병원 카테고리 관리</DialogTitle>
          </DialogHeader>
          <HospitalCategoryManagement />
        </DialogContent>
      </Dialog>
    </>
  );
}
