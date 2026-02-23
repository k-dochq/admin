import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { VersionDataResponse } from '@/lib/app-store-connect/types';

export interface AppStoreVersionsResponse {
  appName: string;
  versions: { id: string; versionString: string; appStoreState: string }[];
}

export async function fetchAppStoreVersions(): Promise<AppStoreVersionsResponse> {
  const res = await fetch('/api/admin/app-info/app-store/versions');
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return {
    appName: data.appName ?? '',
    versions: data.versions ?? [],
  };
}

export function useAppStoreVersions() {
  return useQuery({
    queryKey: queryKeys.appStore.versions,
    queryFn: fetchAppStoreVersions,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export async function fetchAppStoreVersionData(version: string): Promise<VersionDataResponse> {
  const res = await fetch(
    `/api/admin/app-info/app-store/version-data?version=${encodeURIComponent(version)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<VersionDataResponse>;
}

export function useAppStoreVersionData(version: string | null) {
  return useQuery({
    queryKey: queryKeys.appStore.versionData(version ?? ''),
    queryFn: () => fetchAppStoreVersionData(version!),
    enabled: !!version,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
