/**
 * App Store Connect API - 메타데이터 기준표 검증
 * 앱 버전의 제목·서브타이틀·소개문구가 baseline과 일치하는지 조회 후 비교
 *
 * 실행: npx tsx scripts/app-store-connect/verify-metadata.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import {
  METADATA_BASELINE,
  apiLocaleToBaselineKey,
  type LocaleMetadata,
} from './metadata-baseline';

const KEY_ID = '58PL82U37A';
const ISSUER_ID = 'd48e6720-dba1-477b-adcf-f3e0e0566453';
const API_BASE = 'https://api.appstoreconnect.apple.com/v1';

function getKeyPath(): string {
  return path.join(__dirname, 'keys', 'AuthKey_58PL82U37A.p8');
}

function createToken(): string {
  const keyPath = getKeyPath();
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `API 키 파일을 찾을 수 없습니다: ${keyPath}\nkeys 폴더에 AuthKey_58PL82U37A.p8 을 넣어주세요.`
    );
  }
  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const now = Math.floor(Date.now() / 1000);
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

/** 공백·줄바꿈 정규화 후 비교 */
function normalizeForCompare(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
}

function stringsMatch(expected: string, actual: string): boolean {
  return normalizeForCompare(expected) === normalizeForCompare(actual);
}

/** 긴 텍스트 요약 (출력용) */
function truncate(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen) + '...';
}

// --- API 응답 타입 ---

interface AppRef {
  type: string;
  id: string;
}

interface AppStoreAppsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: { name?: string; bundleId?: string; primaryLocale?: string };
  }>;
}

interface AppStoreVersionsResponse {
  data: Array<{
    type: string;
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
    type: string;
    id: string;
    attributes: {
      locale?: string;
      name?: string;
      subtitle?: string;
      description?: string;
    };
  }>;
}

async function fetchJson<T>(
  token: string,
  url: string
): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 오류 (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function main(): Promise<void> {
  console.log('App Store Connect API - 메타데이터 기준표 검증\n');
  try {
    const token = createToken();
    console.log('JWT 발급 완료\n');

    const appsRes = await fetchJson<AppStoreAppsResponse>(
      token,
      `${API_BASE}/apps?limit=200`
    );
    const apps = appsRes.data ?? [];
    if (apps.length === 0) {
      console.log('등록된 앱이 없습니다.');
      return;
    }
    const app = apps[0];
    const appId = app.id;
    console.log(`앱: ${app.attributes?.name ?? appId} (id: ${appId})\n`);

    const versionsRes = await fetchJson<AppStoreVersionsResponse>(
      token,
      `${API_BASE}/apps/${appId}/appStoreVersions?limit=20&filter[platform]=IOS`
    );
    const versions = versionsRes.data ?? [];
    if (versions.length === 0) {
      console.log('iOS App Store 버전이 없습니다.');
      return;
    }
    const ready = versions.find(
      (v) => (v.attributes?.appStoreState ?? '') === 'READY_FOR_SALE'
    );
    const version = ready ?? versions[0];
    const versionId = version.id;
    console.log(
      `버전: ${version.attributes?.versionString ?? versionId} (state: ${version.attributes?.appStoreState ?? '-'})\n`
    );

    const locsRes = await fetchJson<AppStoreVersionLocalizationsResponse>(
      token,
      `${API_BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=50`
    );
    const localizations = locsRes.data ?? [];
    if (localizations.length === 0) {
      console.log('로컬라이제이션이 없습니다.');
      return;
    }

    let hasMismatch = false;
    const baselineLocales = Object.keys(METADATA_BASELINE);

    for (const loc of localizations) {
      const apiLocale = (loc.attributes?.locale ?? '').trim();
      if (!apiLocale) continue;
      const baselineKey = apiLocaleToBaselineKey(apiLocale);
      const baseline = METADATA_BASELINE[baselineKey];
      if (!baseline) continue;

      const actual: LocaleMetadata = {
        name: loc.attributes?.name ?? '',
        subtitle: loc.attributes?.subtitle ?? '',
        description: loc.attributes?.description ?? '',
      };

      const nameOk = stringsMatch(baseline.name, actual.name);
      const subtitleOk = stringsMatch(baseline.subtitle, actual.subtitle);
      const descOk = stringsMatch(baseline.description, actual.description);

      if (!nameOk || !subtitleOk || !descOk) hasMismatch = true;

      console.log(`[${apiLocale}] ${baselineKey}`);
      console.log(`  name:     ${nameOk ? 'O' : 'X'}`);
      if (!nameOk) {
        console.log(`    expected: ${truncate(baseline.name, 60)}`);
        console.log(`    actual:   ${truncate(actual.name, 60)}`);
      }
      console.log(`  subtitle: ${subtitleOk ? 'O' : 'X'}`);
      if (!subtitleOk) {
        console.log(`    expected: ${truncate(baseline.subtitle, 60)}`);
        console.log(`    actual:   ${truncate(actual.subtitle, 60)}`);
      }
      console.log(`  description: ${descOk ? 'O' : 'X'}`);
      if (!descOk) {
        console.log(`    expected: ${truncate(baseline.description, 80)}`);
        console.log(`    actual:   ${truncate(actual.description, 80)}`);
      }
      console.log('');
    }

    const checkedCount = localizations.filter((loc) => {
      const key = apiLocaleToBaselineKey(loc.attributes?.locale ?? '');
      return key in METADATA_BASELINE;
    }).length;
    console.log(
      `기준표와 비교한 로케일: ${checkedCount}개 (baseline 로케일 수: ${baselineLocales.length})`
    );
    if (hasMismatch) {
      console.log('\n일부 필드가 기준표와 다릅니다.');
      process.exit(1);
    }
    console.log('\n모든 비교 로케일이 기준표와 일치합니다.');
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
