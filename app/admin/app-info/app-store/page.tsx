'use client';

import { useState, useEffect } from 'react';
import { useAppStoreVersions, useAppStoreVersionData } from '@/lib/queries/app-store';
import {
  AppStorePageHeader,
  EmptyLocalesCard,
  ErrorMessageCard,
  LocaleTabsCard,
  MetadataLoadingState,
  RejectionDetailsLinkCard,
  VersionSelectCard,
} from './components';

const DEFAULT_VERSION = '1.5.6113';

export default function AppStoreAppInfoPage() {
  const [selectedVersion, setSelectedVersion] = useState(DEFAULT_VERSION);

  const {
    data: versionsData,
    isLoading: loadingVersions,
    isError: versionsError,
    error: versionsErr,
  } = useAppStoreVersions();

  const {
    data: versionData,
    isLoading: loadingData,
    isError: versionDataError,
    error: versionDataErr,
  } = useAppStoreVersionData(selectedVersion || null);

  const versions = versionsData?.versions ?? [];
  const appName = versionsData?.appName ?? '';

  useEffect(() => {
    if (versions.length > 0 && !versions.some((v) => v.versionString === selectedVersion)) {
      setSelectedVersion(versions[0].versionString);
    }
  }, [versions, selectedVersion]);

  const currentLocales = versionData?.locales ?? [];
  const error = versionsError
    ? String(versionsErr?.message ?? '버전 목록을 불러오지 못했습니다.')
    : versionDataError
      ? String(versionDataErr?.message ?? '메타데이터를 불러오지 못했습니다.')
      : null;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <AppStorePageHeader />

      {error && <ErrorMessageCard message={error} />}

      <VersionSelectCard
        appName={appName}
        versions={versions}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
        isLoading={loadingVersions}
      />

      {!loadingData && versionData?.reviewSubmissionDetailsUrl && (
        <RejectionDetailsLinkCard url={versionData.reviewSubmissionDetailsUrl} />
      )}

      {loadingData && <MetadataLoadingState />}

      {!loadingData && versionData && currentLocales.length > 0 && (
        <LocaleTabsCard versionString={versionData.versionString} locales={currentLocales} />
      )}

      {!loadingData && versionData && currentLocales.length === 0 && <EmptyLocalesCard />}
    </div>
  );
}
