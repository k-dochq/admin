import { BannerManagement } from '@/features/banner-management/ui';

export default function MainBannersPage() {
  return (
    <div className='container mx-auto py-6'>
      <BannerManagement bannerType='MAIN' />
    </div>
  );
}
