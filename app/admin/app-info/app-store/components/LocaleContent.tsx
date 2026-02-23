import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { VersionDataLocale } from '@/lib/app-store-connect/types';
import { MatchBadge } from './MatchBadge';
import { TextBlock } from './TextBlock';

interface LocaleContentProps {
  locale: VersionDataLocale;
}

export function LocaleContent({ locale }: LocaleContentProps) {
  const { appInfo, version, baseline, comparison, screenshotSets } = locale;
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">메타데이터 (기준표 대비)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">필드</TableHead>
              <TableHead>기준표</TableHead>
              <TableHead>실제 값 (API)</TableHead>
              <TableHead className="w-24">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">제목 (name)</TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {baseline?.name ?? '-'}
              </TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {appInfo.name || '(비어 있음)'}
              </TableCell>
              <TableCell>
                <MatchBadge match={comparison.nameMatch} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">서브타이틀</TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {baseline?.subtitle ?? '-'}
              </TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {appInfo.subtitle || '(비어 있음)'}
              </TableCell>
              <TableCell>
                <MatchBadge match={comparison.subtitleMatch} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">소개문구</TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {baseline?.description ?? '-'}
              </TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {version.description ?? '(비어 있음)'}
              </TableCell>
              <TableCell>
                <MatchBadge match={comparison.descriptionMatch} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">What&apos;s New</TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {baseline?.whatsNew ?? '-'}
              </TableCell>
              <TableCell className="max-w-md whitespace-pre-wrap break-words align-top">
                {version.whatsNew ?? '(비어 있음)'}
              </TableCell>
              <TableCell>
                <MatchBadge match={comparison.whatsNewMatch} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">전문 (펼쳐보기)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextBlock title="기준표 소개문구" value={baseline?.description ?? ''} />
          <TextBlock title="실제 소개문구" value={version.description} />
          <TextBlock title="기준표 What's New" value={baseline?.whatsNew ?? ''} maxLen={300} />
          <TextBlock title="실제 What's New" value={version.whatsNew} maxLen={300} />
        </div>
      </section>

      {screenshotSets.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">스크린샷</h3>
          {screenshotSets.map((set) => (
            <div key={set.id} className="mb-6">
              <p className="mb-2 text-sm font-medium">{set.displayType}</p>
              <div className="flex flex-wrap gap-3">
                {set.screenshots.map((shot) => (
                  <div
                    key={shot.id}
                    className="flex h-48 w-28 flex-shrink-0 overflow-hidden rounded-lg border bg-muted"
                  >
                    {shot.imageUrl ? (
                      <img
                        src={shot.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {screenshotSets.length === 0 && (
        <section>
          <p className="text-muted-foreground text-sm">이 로케일에는 스크린샷 세트가 없습니다.</p>
        </section>
      )}
    </div>
  );
}
