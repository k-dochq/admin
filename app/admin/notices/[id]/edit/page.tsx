import { NoticeForm } from '@/features/notice-management/ui/NoticeForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NoticeEditPage({ params }: PageProps) {
  const { id } = await params;

  return <NoticeForm mode='edit' noticeId={id} />;
}
