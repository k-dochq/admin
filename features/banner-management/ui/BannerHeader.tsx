'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { type EventBannerType } from '@prisma/client';

interface BannerHeaderProps {
  bannerType: EventBannerType;
}

export function BannerHeader({ bannerType }: BannerHeaderProps) {
  const router = useRouter();

  const title = bannerType === 'MAIN' ? '메인배너 관리' : '띠배너 관리';
  const description =
    bannerType === 'MAIN'
      ? '메인 페이지에 표시되는 메인배너를 관리할 수 있습니다.'
      : '메인 페이지에 표시되는 띠배너를 관리할 수 있습니다.';

  const handleAddBanner = () => {
    const typePath = bannerType.toLowerCase();
    router.push(`/admin/banners/${typePath}/add`);
  };

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h2 className='text-2xl font-bold'>{title}</h2>
        <p className='text-muted-foreground'>{description}</p>
      </div>
      <Button onClick={handleAddBanner}>
        <Plus className='mr-2 h-4 w-4' />
        배너 추가
      </Button>
    </div>
  );
}
