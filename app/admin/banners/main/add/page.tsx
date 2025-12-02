import { BannerForm } from '@/features/banner-management/ui';

export default function AddMainBannerPage() {
  return (
    <div className='container mx-auto py-6'>
      <BannerForm bannerType='MAIN' />
    </div>
  );
}
