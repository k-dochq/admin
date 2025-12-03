import { LiveReviewEditPage } from '@/features/live-review-management';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <LiveReviewEditPage liveReviewId={id} />;
}
