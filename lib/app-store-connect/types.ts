export interface VersionDataLocale {
  locale: string;
  baselineKey: string;
  appInfo: { name: string; subtitle: string };
  version: { description: string; whatsNew: string };
  baseline: { name: string; subtitle: string; description: string; whatsNew: string } | null;
  comparison: {
    nameMatch: boolean;
    subtitleMatch: boolean;
    descriptionMatch: boolean;
    whatsNewMatch: boolean;
  };
  screenshotSets: Array<{
    id: string;
    displayType: string;
    screenshots: Array<{ id: string; imageUrl?: string; width?: number; height?: number }>;
  }>;
}

export interface VersionDataResponse {
  appId: string;
  appName: string;
  versionId: string;
  versionString: string;
  editableAppInfoId: string;
  locales: VersionDataLocale[];
}
