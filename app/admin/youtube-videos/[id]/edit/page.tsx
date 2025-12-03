import { YoutubeVideoEditPage } from '@/features/youtube-video-management/ui/YoutubeVideoEditPage';

interface YoutubeVideoEditPageRouteProps {
  params: Promise<{ id: string }>;
}

export default async function YoutubeVideoEditPageRoute({
  params,
}: YoutubeVideoEditPageRouteProps) {
  const { id } = await params;
  return <YoutubeVideoEditPage videoId={id} />;
}
