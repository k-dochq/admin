'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function BannerHeader() {
  const router = useRouter();

  const handleAddBanner = () => {
    router.push('/admin/banners/add');
  };

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h2 className='text-2xl font-bold'>배너 관리</h2>
        <p className='text-muted-foreground'>
          메인 페이지에 표시되는 이벤트 배너를 관리할 수 있습니다.
        </p>
      </div>
      <Button onClick={handleAddBanner}>
        <Plus className='mr-2 h-4 w-4' />
        배너 추가
      </Button>
    </div>
  );
}
