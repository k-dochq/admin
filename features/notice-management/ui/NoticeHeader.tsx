'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function NoticeHeader() {
  const router = useRouter();

  const handleAddNotice = () => {
    router.push('/admin/notices/add');
  };

  return (
    <div className='flex items-center justify-end'>
      <Button onClick={handleAddNotice}>
        <Plus className='mr-2 h-4 w-4' />
        공지사항 추가
      </Button>
    </div>
  );
}
