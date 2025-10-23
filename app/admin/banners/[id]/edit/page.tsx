import { BannerForm } from '@/features/banner-management/ui';

interface EditBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params;

  return (
    <div className='container mx-auto py-6'>
      <BannerForm bannerId={id} />
    </div>
  );
}
