import { BannerForm } from '@/features/banner-management/ui';

export default function AddRibbonBannerPage() {
  return (
    <div className='container mx-auto py-6'>
      <BannerForm bannerType='RIBBON' />
    </div>
  );
}
