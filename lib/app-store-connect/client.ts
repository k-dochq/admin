import { createAppStoreConnectToken, authHeaders, API_BASE } from './auth';

export type JsonApiResponse<T> = {
  data: T;
  links?: { next?: string };
};

async function fetchJson<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`App Store Connect API 오류 (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllPages<T extends { data: unknown[]; links?: { next?: string } }>(
  token: string,
  firstUrl: string,
): Promise<T['data']> {
  const all: T['data'] = [];
  let nextUrl: string | undefined = firstUrl;
  while (nextUrl) {
    const page: T = await fetchJson<T>(token, nextUrl);
    all.push(...(page.data ?? []));
    nextUrl = page.links?.next;
  }
  return all;
}

export interface AppStoreAppsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: { name?: string; bundleId?: string; primaryLocale?: string };
  }>;
}

export interface AppInfosResponse {
  data: Array<{
    type: string;
    id: string;
    attributes?: { state?: string; appStoreState?: string };
  }>;
}

export interface AppInfoLocalizationsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: { locale?: string; name?: string; subtitle?: string };
  }>;
  links?: { next?: string };
}

export interface AppStoreVersionsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: { versionString?: string; platform?: string; appStoreState?: string };
  }>;
}

export interface AppStoreVersionLocalizationsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: { locale?: string; description?: string; whatsNew?: string };
  }>;
  links?: { next?: string };
}

export async function getToken(): Promise<string> {
  return createAppStoreConnectToken();
}

export async function fetchApps(token: string): Promise<AppStoreAppsResponse> {
  return fetchJson(token, `${API_BASE}/apps?limit=200`);
}

export async function getEditableAppInfo(
  token: string,
  appId: string,
): Promise<{ id: string; state: string }> {
  const res = await fetchJson<AppInfosResponse>(
    token,
    `${API_BASE}/apps/${appId}/appInfos?limit=200&fields[appInfos]=state,appStoreState`,
  );
  const list = res.data ?? [];
  if (list.length === 0) throw new Error('appInfos가 없습니다.');
  const preferredStateKeywords = [
    'PREPARE',
    'DEVELOPER',
    'REJECT',
    'WAITING',
    'IN_REVIEW',
    'PENDING',
    'PROCESSING',
  ];
  const preferred = list.find((x) => {
    const s = (x.attributes?.state ?? x.attributes?.appStoreState ?? '').toUpperCase();
    return preferredStateKeywords.some((k) => s.includes(k));
  });
  const chosen = preferred ?? list[0]!;
  const state = chosen.attributes?.state ?? chosen.attributes?.appStoreState ?? '-';
  return { id: chosen.id, state };
}

export async function fetchAppInfoLocalizations(
  token: string,
  appInfoId: string,
): Promise<AppInfoLocalizationsResponse['data']> {
  return fetchAllPages<AppInfoLocalizationsResponse>(
    token,
    `${API_BASE}/appInfos/${appInfoId}/appInfoLocalizations?limit=200`,
  );
}

export async function fetchAppStoreVersions(
  token: string,
  appId: string,
): Promise<AppStoreVersionsResponse['data']> {
  const res = await fetchJson<AppStoreVersionsResponse>(
    token,
    `${API_BASE}/apps/${appId}/appStoreVersions?limit=50&filter[platform]=IOS`,
  );
  return res.data ?? [];
}

export async function fetchAppStoreVersionLocalizations(
  token: string,
  versionId: string,
): Promise<AppStoreVersionLocalizationsResponse['data']> {
  return fetchAllPages<AppStoreVersionLocalizationsResponse>(
    token,
    `${API_BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`,
  );
}

export interface AppScreenshotSetsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes?: { screenshotDisplayType?: string };
  }>;
  links?: { next?: string };
}

export interface AppScreenshotsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes?: {
      imageAsset?: { templateUrl?: string; width?: number; height?: number };
      assetDeliveryState?: { state?: string };
    };
  }>;
  links?: { next?: string };
}

export async function fetchAppScreenshotSets(
  token: string,
  versionLocalizationId: string,
): Promise<AppScreenshotSetsResponse['data']> {
  return fetchAllPages<AppScreenshotSetsResponse>(
    token,
    `${API_BASE}/appStoreVersionLocalizations/${versionLocalizationId}/appScreenshotSets?limit=50`,
  );
}

export async function fetchAppScreenshots(
  token: string,
  screenshotSetId: string,
): Promise<AppScreenshotsResponse['data']> {
  return fetchAllPages<AppScreenshotsResponse>(
    token,
    `${API_BASE}/appScreenshotSets/${screenshotSetId}/appScreenshots?limit=50`,
  );
}

// --- Review Submissions (리젝 사유 링크용) ---

export interface ReviewSubmissionsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes?: { platform?: string; submittedDate?: string | null; state?: string };
    relationships?: { items?: { links?: { related?: string } } };
  }>;
  links?: { next?: string };
}

export interface ReviewSubmissionItemsResponse {
  data: Array<{
    type: string;
    id: string;
    relationships?: {
      appStoreVersion?: { data?: { type?: string; id?: string } };
      appStoreVersionExperiment?: { data?: { type?: string; id?: string } };
    };
  }>;
  links?: { next?: string };
}

export async function fetchReviewSubmissions(
  token: string,
  appId: string,
): Promise<ReviewSubmissionsResponse['data']> {
  const data = await fetchAllPages<ReviewSubmissionsResponse>(
    token,
    `${API_BASE}/apps/${appId}/reviewSubmissions?limit=50`,
  );
  return data.filter((s) => (s.attributes?.platform ?? 'IOS') === 'IOS');
}

export interface ReviewSubmissionItemsFullResponse extends ReviewSubmissionItemsResponse {
  included?: Array<{ type: string; id: string }>;
}

export async function fetchReviewSubmissionItems(
  token: string,
  submissionId: string,
): Promise<ReviewSubmissionItemsResponse['data']> {
  const res = await fetchJson<ReviewSubmissionItemsFullResponse>(
    token,
    `${API_BASE}/reviewSubmissions/${submissionId}/items?limit=100&include=appStoreVersion`,
  );
  return res.data ?? [];
}

const REVIEW_SUBMISSION_DETAILS_BASE =
  'https://appstoreconnect.apple.com/apps';

function extractAppStoreVersionId(
  item: ReviewSubmissionItemsResponse['data'][number],
): string | null {
  const rel = item.relationships;
  if (!rel) return null;
  const versionData =
    rel.appStoreVersion?.data ??
    (rel as Record<string, { data?: { id?: string } }>).appStoreVersion?.data;
  if (versionData?.id) return versionData.id;
  for (const key of Object.keys(rel)) {
    const data = (rel as Record<string, { data?: { type?: string; id?: string } }>)[key]?.data;
    if (data?.type === 'appStoreVersions' && data?.id) return data.id;
  }
  return null;
}

export async function resolveReviewSubmissionIdForVersion(
  token: string,
  appId: string,
  versionId: string,
): Promise<string | null> {
  const submissions = await fetchReviewSubmissions(token, appId);
  for (const submission of submissions) {
    try {
      const items = await fetchReviewSubmissionItems(token, submission.id);
      const hasMatchingVersion = items.some((item) => {
        const linkedVersionId = extractAppStoreVersionId(item);
        return linkedVersionId === versionId;
      });
      if (hasMatchingVersion) {
        return submission.id;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function buildReviewSubmissionDetailsUrl(
  appId: string,
  reviewSubmissionId: string,
): string {
  return `${REVIEW_SUBMISSION_DETAILS_BASE}/${appId}/distribution/reviewsubmissions/details/${reviewSubmissionId}`;
}

export { API_BASE };
