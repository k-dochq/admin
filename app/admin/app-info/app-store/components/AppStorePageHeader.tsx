import { Smartphone } from 'lucide-react';

export function AppStorePageHeader() {
  return (
    <div className="flex items-center gap-2">
      <Smartphone className="h-6 w-6 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">App Store 앱정보</h1>
    </div>
  );
}
