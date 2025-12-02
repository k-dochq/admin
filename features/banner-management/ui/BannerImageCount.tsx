import { type EventBannerWithImages } from '@/features/banner-management/api';

interface BannerImageCountProps {
  banner: EventBannerWithImages;
}

export function BannerImageCount({ banner }: BannerImageCountProps) {
  const count = banner.bannerImages?.length || 0;
  return <span className='text-sm'>{count}장</span>;
}
