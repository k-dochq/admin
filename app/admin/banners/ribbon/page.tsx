import { BannerManagement } from '@/features/banner-management/ui';

export default function RibbonBannersPage() {
  return (
    <div className='container mx-auto py-6'>
      <BannerManagement bannerType='RIBBON' />
    </div>
  );
}
