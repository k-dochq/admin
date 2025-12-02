import { BannerForm } from '@/features/banner-management/ui';

interface EditRibbonBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRibbonBannerPage({ params }: EditRibbonBannerPageProps) {
  const { id } = await params;

  return (
    <div className='container mx-auto py-6'>
      <BannerForm bannerId={id} bannerType='RIBBON' />
    </div>
  );
}
