import { ReviewEditPage } from '@/features/review-management/ui/ReviewEditPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ReviewEditPage reviewId={id} />;
}
