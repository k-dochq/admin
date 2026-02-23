import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export function MatchBadge({ match }: { match: boolean }) {
  return match ? (
    <Badge variant="default" className="bg-green-600 gap-1">
      <Check className="h-3 w-3" /> 일치
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <X className="h-3 w-3" /> 불일치
    </Badge>
  );
}
