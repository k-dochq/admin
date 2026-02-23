import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { VersionDataLocale } from '@/lib/app-store-connect/types';
import { LocaleContent } from './LocaleContent';

interface LocaleTabsCardProps {
  versionString: string;
  locales: VersionDataLocale[];
}

export function LocaleTabsCard({ versionString, locales }: LocaleTabsCardProps) {
  const defaultTab = locales[0]?.locale ?? '';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">언어별 메타데이터 · 스크린샷</CardTitle>
        <p className="text-muted-foreground text-sm">
          버전 {versionString} · 기준표 대비 일치/불일치
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-1">
            {locales.map((loc) => (
              <TabsTrigger key={loc.locale} value={loc.locale}>
                {loc.baselineKey || loc.locale}
              </TabsTrigger>
            ))}
          </TabsList>
          {locales.map((loc) => (
            <TabsContent key={loc.locale} value={loc.locale}>
              <LocaleContent locale={loc} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
