/**
 * App Store Connect API - 메타데이터 기준표 검증 (앱 레벨 + 버전 레벨)
 *
 * - App Info Localizations: name(제목), subtitle(서브타이틀)
 * - App Store Version Localizations: description(소개문구)
 *
 * 실행:
 *   npx tsx scripts/app-store-connect/verify-metadata.ts
 *     → 기본 버전 1.5.6113으로 검증
 *   npx tsx scripts/app-store-connect/verify-metadata.ts --version=1.5.6112
 *     → 지정한 버전으로 검증
 */

import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import {
  METADATA_BASELINE,
  apiLocaleToBaselineKey,
  normalizeForCompare,
  stringsMatch,
  type LocaleMetadata,
} from '../../lib/app-store-connect/baseline';

const KEY_ID = '58PL82U37A';
const ISSUER_ID = 'd48e6720-dba1-477b-adcf-f3e0e0566453';
const API_BASE = 'https://api.appstoreconnect.apple.com/v1';

function getKeyPath(): string {
  return path.join(__dirname, 'keys', `AuthKey_${KEY_ID}.p8`);
}

function createToken(): string {
  const keyPath = getKeyPath();
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `API 키 파일을 찾을 수 없습니다: ${keyPath}\nkeys 폴더에 AuthKey_${KEY_ID}.p8 을 넣어주세요.`,
    );
  }
  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const now = Math.floor(Date.now() / 1000);

  // ✅ aud는 반드시 appstoreconnect-v1
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 20 * 60,
    aud: 'appstoreconnect-v1' as const,
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    keyid: KEY_ID,
    header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' },
  });
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** 여러 줄 텍스트를 첫 N자 + "(… 총 M자)" 형태로 요약 */
function summarizeLong(text: string, headLen: number): string {
  const t = (text ?? '').trim();
  if (!t) return '(비어 있음)';
  if (t.length <= headLen) return t;
  return `${t.slice(0, headLen)}... (이하 생략, 총 ${t.length}자)`;
}

async function fetchJson<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 오류 (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ------------------ API 타입 ------------------

interface AppStoreAppsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: {
      name?: string;
      bundleId?: string;
      primaryLocale?: string;
    };
  }>;
}

interface AppInfosResponse {
  data: Array<{
    type: 'appInfos';
    id: string;
    attributes?: {
      state?: string;
      appStoreState?: string;
    };
  }>;
}

interface AppInfoLocalizationsResponse {
  data: Array<{
    type: 'appInfoLocalizations';
    id: string;
    attributes: {
      locale?: string; // e.g. "ko", "en-US", "zh-Hant"
      name?: string;
      subtitle?: string;
      privacyPolicyUrl?: string;
    };
  }>;
  links?: { next?: string };
}

interface AppStoreVersionsResponse {
  data: Array<{
    type: 'appStoreVersions';
    id: string;
    attributes: {
      versionString?: string;
      platform?: string;
      appStoreState?: string;
    };
  }>;
}

interface AppStoreVersionLocalizationsResponse {
  data: Array<{
    type: 'appStoreVersionLocalizations';
    id: string;
    attributes: {
      locale?: string; // e.g. "ko", "en-US", "zh-Hant"
      description?: string;

      // 필요하면 확장:
      promotionalText?: string;
      whatsNew?: string;
      keywords?: string;
    };
  }>;
  links?: { next?: string };
}

// ------------------ 페이징 유틸 ------------------

async function fetchAllPages<T extends { data: any[]; links?: { next?: string } }>(
  token: string,
  firstUrl: string,
): Promise<T['data']> {
  const all: T['data'] = [];
  let nextUrl: string | undefined = firstUrl;
  while (nextUrl) {
    const page = await fetchJson<T>(token, nextUrl);
    all.push(...(page.data ?? []));
    nextUrl = page.links?.next;
  }
  return all;
}

// ------------------ AppInfo 선택 (sync-metadata와 동일 규칙) ------------------

/**
 * sync-metadata의 getEditableAppInfoId()와 동일한 규칙으로
 * "편집 가능한" AppInfo를 선택 (verify 시 같은 AppInfo를 보도록 함).
 */
async function getEditableAppInfo(
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

// ------------------ 핵심 조회 로직 ------------------

/**
 * 앱 레벨: AppInfoLocalizations에서 name/subtitle 가져오기
 * sync와 동일한 AppInfo(편집 가능 우선)를 사용해 비교 시 일치하도록 함.
 */
async function fetchAppInfoLocalizations(
  token: string,
  appId: string,
  appInfoId: string,
): Promise<AppInfoLocalizationsResponse['data']> {
  return fetchAllPages<AppInfoLocalizationsResponse>(
    token,
    `${API_BASE}/appInfos/${appInfoId}/appInfoLocalizations?limit=200`,
  );
}

/**
 * 버전 레벨: AppStoreVersionLocalizations에서 description 가져오기
 */
async function fetchAppStoreVersionLocalizations(
  token: string,
  versionId: string,
): Promise<AppStoreVersionLocalizationsResponse['data']> {
  return fetchAllPages<AppStoreVersionLocalizationsResponse>(
    token,
    `${API_BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`,
  );
}

// ------------------ 비교/리포트 ------------------

type Mismatch = { mismatchFields: string[] };

function ensureLocaleResult(obj: Record<string, 'match' | 'mismatch' | Mismatch>, key: string) {
  if (!(key in obj)) obj[key] = 'match';
}

function setMismatch(
  obj: Record<string, 'match' | 'mismatch' | Mismatch>,
  key: string,
  fields: string[],
) {
  obj[key] = { mismatchFields: fields };
}

function getMismatchFields(r: 'match' | 'mismatch' | Mismatch): string[] {
  if (r === 'match') return [];
  if (r === 'mismatch') return ['(unknown)'];
  return r.mismatchFields ?? [];
}

const DEFAULT_VERSION = '1.5.6113';

/** process.argv에서 --version=1.5.6113 또는 --version 1.5.6113 파싱 */
function getVersionFromArgv(): string | undefined {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i]!.startsWith('--version=')) {
      return args[i]!.slice('--version='.length).trim() || undefined;
    }
    if (args[i] === '--version' && args[i + 1]) {
      return args[i + 1]!.trim();
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  console.log('App Store Connect API - 메타데이터 기준표 검증 (앱 레벨 + 버전 레벨)\n');

  try {
    const token = createToken();
    console.log('JWT 발급 완료\n');

    // 1) 앱 선택
    const appsRes = await fetchJson<AppStoreAppsResponse>(token, `${API_BASE}/apps?limit=200`);

    const apps = appsRes.data ?? [];
    if (apps.length === 0) {
      console.log('등록된 앱이 없습니다.');
      return;
    }

    const app = apps[0]; // 필요하면 bundleId로 필터링하도록 바꿔도 됨
    const appId = app.id;

    console.log(`앱: ${app.attributes?.name ?? appId} (id: ${appId})\n`);

    // 2) iOS 버전 선택 (--version 지정 시 해당 버전, 없으면 기본값 1.5.6113)
    const versionArg = getVersionFromArgv();
    const targetVersion = versionArg ?? DEFAULT_VERSION;
    if (versionArg) {
      console.log(`지정 버전으로 검증: ${versionArg}\n`);
    } else {
      console.log(`기본 버전으로 검증: ${DEFAULT_VERSION}\n`);
    }
    const versionsRes = await fetchJson<AppStoreVersionsResponse>(
      token,
      `${API_BASE}/apps/${appId}/appStoreVersions?limit=50&filter[platform]=IOS`,
    );

    const versions = versionsRes.data ?? [];
    if (versions.length === 0) {
      console.log('iOS App Store 버전이 없습니다.');
      return;
    }

    const matched = versions.find(
      (v) => (v.attributes?.versionString ?? '').trim() === targetVersion.trim(),
    );
    if (!matched) {
      const list = versions.map((v) => v.attributes?.versionString ?? v.id).join(', ');
      throw new Error(
        `버전 "${targetVersion}"을 찾을 수 없습니다. 사용 가능: ${list}`,
      );
    }
    const version = matched;
    const versionId = version.id;

    const editableAppInfo = await getEditableAppInfo(token, appId);

    console.log(
      `버전: ${version.attributes?.versionString ?? versionId} (state: ${version.attributes?.appStoreState ?? '-'})`,
    );
    console.log(
      `App Info ID: ${editableAppInfo.id} (state: ${editableAppInfo.state})\n`,
    );

    // 3) 로컬라이제이션 조회 (2종) — sync와 동일한 AppInfo 사용
    const [appInfoLocs, versionLocs] = await Promise.all([
      fetchAppInfoLocalizations(token, appId, editableAppInfo.id),
      fetchAppStoreVersionLocalizations(token, versionId),
    ]);

    console.log(
      'API locales (AppInfo):',
      Array.from(new Set(appInfoLocs.map((l) => l.attributes?.locale).filter(Boolean))),
    );
    console.log(
      'API locales (Version):',
      Array.from(new Set(versionLocs.map((l) => l.attributes?.locale).filter(Boolean))),
    );
    console.log('');

    const baselineLocales = Object.keys(METADATA_BASELINE).sort();
    const localeResult: Record<string, 'match' | 'mismatch' | Mismatch> = {};
    for (const key of baselineLocales) localeResult[key] = 'match';

    // 빠른 접근을 위해 locale별로 묶기 (baselineKey 단위)
    const appInfoByKey = new Map<string, { locale: string; name: string; subtitle: string }>();
    for (const loc of appInfoLocs) {
      const apiLocale = (loc.attributes?.locale ?? '').trim();
      if (!apiLocale) continue;
      const key = apiLocaleToBaselineKey(apiLocale);
      appInfoByKey.set(key, {
        locale: apiLocale,
        name: loc.attributes?.name ?? '',
        subtitle: loc.attributes?.subtitle ?? '',
      });
    }

    const versionByKey = new Map<string, { locale: string; description: string; whatsNew: string }>();
    for (const loc of versionLocs) {
      const apiLocale = (loc.attributes?.locale ?? '').trim();
      if (!apiLocale) continue;
      const key = apiLocaleToBaselineKey(apiLocale);
      versionByKey.set(key, {
        locale: apiLocale,
        description: loc.attributes?.description ?? '',
        whatsNew: loc.attributes?.whatsNew ?? '',
      });
    }

    // 기준표 로케일별로, AppInfo + Version을 합쳐 비교
    let hasMismatch = false;

    for (const baselineKey of baselineLocales) {
      const baseline = METADATA_BASELINE[baselineKey];

      const appInfo = appInfoByKey.get(baselineKey);
      const versionLoc = versionByKey.get(baselineKey);

      const inApi = Boolean(appInfo || versionLoc);
      ensureLocaleResult(localeResult, baselineKey);

      if (!inApi) continue; // 아래 "요약"에서 API에 없음으로 표시

      const actual: LocaleMetadata = {
        name: appInfo?.name ?? '',
        subtitle: appInfo?.subtitle ?? '',
        description: versionLoc?.description ?? '',
        whatsNew: versionLoc?.whatsNew ?? '',
      };

      const mismatchFields: string[] = [];

      const nameOk = stringsMatch(baseline.name, actual.name);
      const subtitleOk = stringsMatch(baseline.subtitle, actual.subtitle);
      const descOk = stringsMatch(baseline.description, actual.description);

      if (!nameOk) mismatchFields.push('name(제목)');
      if (!subtitleOk) mismatchFields.push('subtitle(서브타이틀)');
      if (!descOk) mismatchFields.push('description(소개문구)');

      if (mismatchFields.length > 0) {
        hasMismatch = true;
        setMismatch(localeResult, baselineKey, mismatchFields);
      }

      const localeLabel = appInfo?.locale || versionLoc?.locale || baselineKey;

      console.log('────────────────────────────────────────');
      console.log(
        `로케일 [${localeLabel}] (${baselineKey}) — ${
          mismatchFields.length === 0
            ? '기준표와 일치'
            : `기준표와 불일치 (${mismatchFields.join(', ')})`
        }`,
      );
      console.log('');

      console.log(`  [제목 name]     ${nameOk ? '✓ 일치' : '✗ 불일치'}`);
      if (!nameOk) {
        console.log(`    기준표:  "${baseline.name || '(비어 있음)'}"`);
        console.log(`    App Info: "${actual.name || '(비어 있음)'}"`);
      }

      console.log(`  [서브타이틀]   ${subtitleOk ? '✓ 일치' : '✗ 불일치'}`);
      if (!subtitleOk) {
        console.log(`    기준표:  "${baseline.subtitle || '(비어 있음)'}"`);
        console.log(`    App Info: "${actual.subtitle || '(비어 있음)'}"`);
      }

      console.log(`  [소개문구]     ${descOk ? '✓ 일치' : '✗ 불일치'}`);
      if (!descOk) {
        console.log(`    기준표:  ${summarizeLong(baseline.description, 100)}`);
        console.log(`    Version: ${summarizeLong(actual.description, 100)}`);
        if (
          normalizeForCompare(baseline.description).length !==
          normalizeForCompare(actual.description).length
        ) {
          console.log(
            `    (글자 수: 기준 ${normalizeForCompare(baseline.description).length}자 / 실제 ${normalizeForCompare(actual.description).length}자)`,
          );
        }
      }

      console.log('');
    }

    // 기준표 대비 비교한 수
    const checkedCount = baselineLocales.filter((k) => {
      return appInfoByKey.has(k) || versionByKey.has(k);
    }).length;

    console.log('════════════════════════════════════════');
    console.log('요약');
    console.log('════════════════════════════════════════');
    console.log(`  기준표 로케일 수: ${baselineLocales.length}개`);
    console.log(`  기준표 로케일 중 API에서 발견된 수: ${checkedCount}개`);
    console.log('');

    for (const key of baselineLocales) {
      const inApi = appInfoByKey.has(key) || versionByKey.has(key);
      const result = localeResult[key];

      if (!inApi) {
        console.log(
          `  [${key}] API에 없음 — App Store에 해당 로케일이 등록되어 있지 않거나(locale 매핑 불일치), 이 API Key 권한 범위에 없습니다.`,
        );
        continue;
      }

      if (result === 'match') {
        console.log(`  [${key}] 기준표와 일치`);
      } else {
        console.log(
          `  [${key}] 기준표와 불일치 — 다른 필드: ${getMismatchFields(result).join(', ')}`,
        );
      }
    }

    console.log('');
    if (hasMismatch) {
      console.log('결과: 일부 필드가 기준표와 다릅니다.');
      process.exit(1);
    } else {
      console.log('결과: 기준표와 모두 일치합니다.');
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
