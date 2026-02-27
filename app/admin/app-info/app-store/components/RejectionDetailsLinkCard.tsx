import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RejectionDetailsLinkCardProps {
  url: string;
}

export function RejectionDetailsLinkCard({ url }: RejectionDetailsLinkCardProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/80">
      <CardContent className="pt-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 hover:underline"
        >
          <span>리젝 사유 확인</span>
          <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-1 text-sm text-amber-700">
          App Store Connect에서 심사 거부 상세 내용을 확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );
}
