import { Loader2 } from 'lucide-react';

export function MetadataLoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="text-muted-foreground">메타데이터 및 스크린샷 불러오는 중...</span>
    </div>
  );
}
