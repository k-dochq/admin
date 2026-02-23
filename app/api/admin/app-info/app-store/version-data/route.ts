import { NextRequest, NextResponse } from 'next/server';
import { METADATA_BASELINE, apiLocaleToBaselineKey, stringsMatch } from '@/lib/app-store-connect/baseline';
import {
  getToken,
  fetchApps,
  getEditableAppInfo,
  fetchAppInfoLocalizations,
  fetchAppStoreVersions,
  fetchAppStoreVersionLocalizations,
  fetchAppScreenshotSets,
  fetchAppScreenshots,
} from '@/lib/app-store-connect/client';
import type { VersionDataLocale, VersionDataResponse } from '@/lib/app-store-connect/types';

const DEFAULT_APP_ID = '6502036150';
const DEFAULT_VERSION = '1.5.6113';

export async function GET(request: NextRequest) {
  try {
    const versionParam = request.nextUrl.searchParams.get('version')?.trim() ?? DEFAULT_VERSION;
    const token = await getToken();

    const appsRes = await fetchApps(token);
    const apps = appsRes.data ?? [];
    const appId = apps[0]?.id ?? DEFAULT_APP_ID;
    const appName = apps[0]?.attributes?.name ?? '';

    const versions = await fetchAppStoreVersions(token, appId);
    const versionMatch = versions.find(
      (v) => (v.attributes?.versionString ?? '').trim() === versionParam,
    );
    if (!versionMatch) {
      const list = versions.map((v) => v.attributes?.versionString ?? v.id).join(', ');
      return NextResponse.json(
        { error: `버전 "${versionParam}"을 찾을 수 없습니다. 사용 가능: ${list}` },
        { status: 404 },
      );
    }
    const versionId = versionMatch.id;
    const versionString = versionMatch.attributes?.versionString ?? versionId;

    const editableAppInfo = await getEditableAppInfo(token, appId);
    const [appInfoLocs, versionLocs] = await Promise.all([
      fetchAppInfoLocalizations(token, editableAppInfo.id),
      fetchAppStoreVersionLocalizations(token, versionId),
    ]);

    const appInfoByLocale = new Map(
      appInfoLocs.map((loc) => {
        const locale = (loc.attributes?.locale ?? '').trim();
        return [
          locale,
          { name: loc.attributes?.name ?? '', subtitle: loc.attributes?.subtitle ?? '' },
        ];
      }),
    );

    const versionByLocale = new Map(
      versionLocs.map((loc) => {
        const locale = (loc.attributes?.locale ?? '').trim();
        return [
          locale,
          {
            id: loc.id,
            description: loc.attributes?.description ?? '',
            whatsNew: loc.attributes?.whatsNew ?? '',
          },
        ];
      }),
    );

    const allLocales = Array.from(
      new Set([...appInfoByLocale.keys(), ...versionByLocale.keys()].filter(Boolean)),
    ).sort();

    const locales: VersionDataLocale[] = [];

    for (const apiLocale of allLocales) {
      const baselineKey = apiLocaleToBaselineKey(apiLocale);
      const baseline = METADATA_BASELINE[baselineKey] ?? null;
      const appInfo = appInfoByLocale.get(apiLocale) ?? { name: '', subtitle: '' };
      const versionLoc = versionByLocale.get(apiLocale);
      const description = versionLoc?.description ?? '';
      const whatsNew = versionLoc?.whatsNew ?? '';

      const nameMatch = baseline ? stringsMatch(baseline.name, appInfo.name) : true;
      const subtitleMatch = baseline ? stringsMatch(baseline.subtitle, appInfo.subtitle) : true;
      const descriptionMatch = baseline ? stringsMatch(baseline.description, description) : true;
      const whatsNewMatch = baseline ? stringsMatch(baseline.whatsNew, whatsNew) : true;

      let screenshotSets: VersionDataLocale['screenshotSets'] = [];
      if (versionLoc?.id) {
        try {
          const sets = await fetchAppScreenshotSets(token, versionLoc.id);
          for (const set of sets) {
            const screenshots = await fetchAppScreenshots(token, set.id);
            const displayType = set.attributes?.screenshotDisplayType ?? set.id;
            const items = screenshots.map((s) => {
              const templateUrl = s.attributes?.imageAsset?.templateUrl;
              const w = s.attributes?.imageAsset?.width;
              const h = s.attributes?.imageAsset?.height;
              let imageUrl: string | undefined;
              if (templateUrl && w && h) {
                imageUrl = templateUrl
                  .replace('{w}', String(w))
                  .replace('{h}', String(h))
                  .replace('{f}', 'png');
              } else if (templateUrl) {
                imageUrl = templateUrl;
              }
              return { id: s.id, imageUrl, width: w, height: h };
            });
            screenshotSets.push({ id: set.id, displayType, screenshots: items });
          }
        } catch {
          screenshotSets = [];
        }
      }

      locales.push({
        locale: apiLocale,
        baselineKey,
        appInfo,
        version: { description, whatsNew },
        baseline,
        comparison: {
          nameMatch,
          subtitleMatch,
          descriptionMatch,
          whatsNewMatch,
        },
        screenshotSets,
      });
    }

    return NextResponse.json({
      appId,
      appName,
      versionId,
      versionString,
      editableAppInfoId: editableAppInfo.id,
      locales,
    } satisfies VersionDataResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
