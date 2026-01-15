'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ReviewManagementHeader() {
  const router = useRouter();

  return (
    <div className='flex items-center justify-between'>
      <h1 className='text-3xl font-bold'>리뷰 관리</h1>
      <Button onClick={() => router.push('/admin/reviews/add')} className='flex items-center gap-2'>
        <Plus className='h-4 w-4' />
        리뷰 추가
      </Button>
    </div>
  );
}
