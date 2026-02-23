import { NextResponse } from 'next/server';
import {
  getToken,
  fetchApps,
  fetchAppStoreVersions,
} from '@/lib/app-store-connect/client';

const DEFAULT_APP_ID = '6502036150';

export async function GET() {
  try {
    const token = await getToken();
    const appsRes = await fetchApps(token);
    const apps = appsRes.data ?? [];
    const appId = apps[0]?.id ?? DEFAULT_APP_ID;

    const versions = await fetchAppStoreVersions(token, appId);
    const list = versions.map((v) => ({
      id: v.id,
      versionString: v.attributes?.versionString ?? '',
      appStoreState: v.attributes?.appStoreState ?? '',
    }));

    return NextResponse.json({
      appId,
      appName: apps[0]?.attributes?.name ?? '',
      versions: list,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
