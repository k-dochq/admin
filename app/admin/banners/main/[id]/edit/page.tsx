import { BannerForm } from '@/features/banner-management/ui';

interface EditMainBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMainBannerPage({ params }: EditMainBannerPageProps) {
  const { id } = await params;

  return (
    <div className='container mx-auto py-6'>
      <BannerForm bannerId={id} bannerType='MAIN' />
    </div>
  );
}
