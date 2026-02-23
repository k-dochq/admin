import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export interface VersionItem {
  id: string;
  versionString: string;
  appStoreState: string;
}

interface VersionSelectCardProps {
  appName: string;
  versions: VersionItem[];
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  isLoading: boolean;
}

export function VersionSelectCard({
  appName,
  versions,
  selectedVersion,
  onVersionChange,
  isLoading,
}: VersionSelectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">버전 선택</CardTitle>
        {appName && <p className="text-muted-foreground text-sm">{appName}</p>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>버전 목록 불러오는 중...</span>
          </div>
        ) : (
          <Select value={selectedVersion} onValueChange={onVersionChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="버전 선택" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.versionString}>
                  {v.versionString} ({v.appStoreState || '-'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
