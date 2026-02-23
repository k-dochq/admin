/**
 * App Store Connect API - 아랍어/러시아어 전용 메타데이터 동기화
 *
 * - App Info Localizations(앱 레벨): name, subtitle (ar, ru)
 * - App Store Version Localizations(버전 레벨): description, whatsNew (ar, ru)
 *
 * ⚠ Version Localization 생성 전에 App Store Connect에서 언어를 추가해야 합니다.
 *    앱 → 앱 정보 → 언어 → "미현지화"에서 Arabic, Russian 추가 후 이 스크립트를 실행하세요.
 *
 * 기본은 DRY RUN. 실제 반영: --apply
 *
 * 실행:
 *   npx tsx scripts/app-store-connect/sync-metadata-ar-ru.ts
 *   npx tsx scripts/app-store-connect/sync-metadata-ar-ru.ts --apply
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

const APP_ID = '6502036150';
const TARGET_VERSION_STRING = '1.5.6113';

// ✅ ar/ru만 관리
const MANAGED_API_LOCALES = ['ar', 'ru'] as const;

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
  return jwt.sign(
    { iss: ISSUER_ID, iat: now, exp: now + 20 * 60, aud: 'appstoreconnect-v1' as const },
    privateKey,
    { algorithm: 'ES256', keyid: KEY_ID, header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' } },
  );
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function normalizeForCompare(s: string): string {
  return (s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+/g, '\n').trim();
}
function stringsMatch(expected: string, actual: string): boolean {
  return normalizeForCompare(expected) === normalizeForCompare(actual);
}

function mustBaselineFor(apiLocale: string): LocaleMetadata | null {
  const key = apiLocaleToBaselineKey(apiLocale);
  return METADATA_BASELINE[key] ?? null;
}

function isApplyMode(): boolean {
  return process.argv.includes('--apply');
}

async function fetchJson<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`API 오류 (${res.status}): ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function sendJson<T>(
  token: string,
  url: string,
  method: 'POST' | 'PATCH',
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API 오류 (${res.status}): ${await res.text()}`);
  return res.json() as Promise<T>;
}

function isInvalidState409(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('(409)') || msg.includes('INVALID_STATE') || msg.includes('current state');
}

// ---------- types ----------
interface AppInfosResponse {
  data: Array<{
    type: 'appInfos';
    id: string;
    attributes?: { state?: string; appStoreState?: string };
  }>;
}
interface AppInfoLocalizationsResponse {
  data: Array<{
    type: 'appInfoLocalizations';
    id: string;
    attributes: { locale?: string; name?: string; subtitle?: string };
  }>;
  links?: { next?: string };
}
interface AppStoreVersionsResponse {
  data: Array<{
    type: 'appStoreVersions';
    id: string;
    attributes: { versionString?: string; appStoreState?: string };
  }>;
}
interface AppStoreVersionLocalizationsResponse {
  data: Array<{
    type: 'appStoreVersionLocalizations';
    id: string;
    attributes: { locale?: string; description?: string; whatsNew?: string };
  }>;
  links?: { next?: string };
}

// ---------- paging ----------
async function fetchAllPages<T extends { data: any[]; links?: { next?: string } }>(
  token: string,
  firstUrl: string,
): Promise<T['data']> {
  const all: T['data'] = [];
  let next: string | undefined = firstUrl;
  while (next) {
    const page = await fetchJson<T>(token, next);
    all.push(...(page.data ?? []));
    next = page.links?.next;
  }
  return all;
}

// ---------- ids ----------
async function getAppInfoIdPreferEditable(token: string, appId: string): Promise<string> {
  const res = await fetchJson<AppInfosResponse>(
    token,
    `${API_BASE}/apps/${appId}/appInfos?limit=200&fields[appInfos]=state,appStoreState`,
  );
  const list = res.data ?? [];
  if (list.length === 0) throw new Error('appInfos가 없습니다.');

  // 상태 로깅(원인 추적에 도움)
  console.log(
    'AppInfos:',
    list.map((x) => ({
      id: x.id,
      state: x.attributes?.state ?? x.attributes?.appStoreState ?? '-',
    })),
  );

  // next-version/편집 가능한 쪽을 우선 선택하려고 키워드 매칭
  const preferred = list.find((x) => {
    const s = (x.attributes?.state ?? x.attributes?.appStoreState ?? '').toUpperCase();
    return ['PREP', 'REJECT', 'DEVELOPER', 'WAIT', 'IN_REVIEW', 'PEND', 'PROCESS'].some((k) =>
      s.includes(k),
    );
  });

  return (preferred ?? list[0]).id;
}

async function getTargetVersionId(token: string, appId: string): Promise<string> {
  const res = await fetchJson<AppStoreVersionsResponse>(
    token,
    `${API_BASE}/apps/${appId}/appStoreVersions?limit=200&filter[platform]=IOS`,
  );
  const match = (res.data ?? []).find(
    (v) => (v.attributes?.versionString ?? '') === TARGET_VERSION_STRING,
  );
  if (!match) throw new Error(`대상 버전 ${TARGET_VERSION_STRING}을 찾지 못했습니다.`);
  return match.id;
}

// ---------- sync ----------
async function syncAppInfoLocalizations(token: string, appInfoId: string, apply: boolean) {
  const existing = await fetchAllPages<AppInfoLocalizationsResponse>(
    token,
    `${API_BASE}/appInfos/${appInfoId}/appInfoLocalizations?limit=200`,
  );

  const byLocale = new Map<string, { id: string; name: string; subtitle: string }>();
  for (const loc of existing) {
    const locale = (loc.attributes?.locale ?? '').trim();
    if (!locale) continue;
    byLocale.set(locale, {
      id: loc.id,
      name: loc.attributes?.name ?? '',
      subtitle: loc.attributes?.subtitle ?? '',
    });
  }

  console.log('\n=== App Info Localizations (ar/ru) ===');
  console.log('Using AppInfo ID:', appInfoId);
  console.log('Existing locales:', Array.from(byLocale.keys()).sort().join(', ') || '(none)');

  for (const apiLocale of MANAGED_API_LOCALES) {
    const baseline = mustBaselineFor(apiLocale);
    if (!baseline) {
      console.log(`[SKIP][${apiLocale}] baseline 없음 (apiLocaleToBaselineKey 매핑/기준표 확인)`);
      continue;
    }

    const cur = byLocale.get(apiLocale);
    if (!cur) {
      console.log(`[CREATE][${apiLocale}] name/subtitle 생성 예정`);
      console.log(`  name: "${baseline.name}"`);
      console.log(`  subtitle: "${baseline.subtitle}"`);
      if (apply) {
        try {
          await sendJson(token, `${API_BASE}/appInfoLocalizations`, 'POST', {
            data: {
              type: 'appInfoLocalizations',
              attributes: { locale: apiLocale, name: baseline.name, subtitle: baseline.subtitle },
              relationships: { appInfo: { data: { type: 'appInfos', id: appInfoId } } },
            },
          });
          console.log('  -> created');
        } catch (e) {
          if (isInvalidState409(e))
            console.log('  -> [SKIP] 현재 state에서 App Info 수정 불가(409).');
          else throw e;
        }
      }
      continue;
    }

    const nameOk = stringsMatch(baseline.name, cur.name);
    const subOk = stringsMatch(baseline.subtitle, cur.subtitle);
    if (nameOk && subOk) {
      console.log(`[OK][${apiLocale}] name/subtitle match`);
      continue;
    }

    console.log(`[PATCH][${apiLocale}] name/subtitle 업데이트 예정`);
    if (!nameOk) console.log(`  name: "${cur.name}" -> "${baseline.name}"`);
    if (!subOk) console.log(`  subtitle: "${cur.subtitle}" -> "${baseline.subtitle}"`);

    if (apply) {
      try {
        await sendJson(token, `${API_BASE}/appInfoLocalizations/${cur.id}`, 'PATCH', {
          data: {
            type: 'appInfoLocalizations',
            id: cur.id,
            attributes: {
              ...(nameOk ? {} : { name: baseline.name }),
              ...(subOk ? {} : { subtitle: baseline.subtitle }),
            },
          },
        });
        console.log('  -> patched');
      } catch (e) {
        if (isInvalidState409(e))
          console.log('  -> [SKIP] 현재 state에서 App Info 수정 불가(409).');
        else throw e;
      }
    }
  }
}

async function syncVersionLocalizations(token: string, versionId: string, apply: boolean) {
  const existing = await fetchAllPages<AppStoreVersionLocalizationsResponse>(
    token,
    `${API_BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`,
  );

  const byLocale = new Map<string, { id: string; description: string; whatsNew: string }>();
  for (const loc of existing) {
    const locale = (loc.attributes?.locale ?? '').trim();
    if (!locale) continue;
    byLocale.set(locale, {
      id: loc.id,
      description: loc.attributes?.description ?? '',
      whatsNew: loc.attributes?.whatsNew ?? '',
    });
  }

  console.log('\n=== App Store Version Localizations (ar/ru) ===');
  console.log('Using Version ID:', versionId);
  console.log('Existing locales:', Array.from(byLocale.keys()).sort().join(', ') || '(none)');
  // 새 언어 추가 시: App Store Connect → 앱 → 앱 정보 → 언어에서 Arabic, Russian을 먼저 추가해야 함.
  console.log('');

  for (const apiLocale of MANAGED_API_LOCALES) {
    const baseline = mustBaselineFor(apiLocale);
    if (!baseline) {
      console.log(`[SKIP][${apiLocale}] baseline 없음 (apiLocaleToBaselineKey 매핑/기준표 확인)`);
      continue;
    }

    const cur = byLocale.get(apiLocale);
    if (!cur) {
      console.log(`[CREATE][${apiLocale}] description/whatsNew 생성 예정`);
      if (apply) {
        try {
          await sendJson(token, `${API_BASE}/appStoreVersionLocalizations`, 'POST', {
            data: {
              type: 'appStoreVersionLocalizations',
              attributes: {
                locale: apiLocale,
                description: baseline.description,
                whatsNew: baseline.whatsNew,
              },
              relationships: {
                appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } },
              },
            },
          });
          console.log('  -> created');
        } catch (err) {
          if (isNotListedForLocalization409(err)) {
            console.log(
              `  -> [건너뜀] "${apiLocale}" 언어가 앱의 현지화 목록에 없습니다. App Store Connect → 앱 → 앱 정보 → 언어에서 Arabic(아랍어) / Russian(러시아어)를 추가한 뒤 다시 실행하세요.`,
            );
          } else {
            throw err;
          }
        }
      }
      continue;
    }

    const descOk = stringsMatch(baseline.description, cur.description);
    const whatsOk = stringsMatch(baseline.whatsNew, cur.whatsNew);
    if (descOk && whatsOk) {
      console.log(`[OK][${apiLocale}] description/whatsNew match`);
      continue;
    }

    console.log(`[PATCH][${apiLocale}] description/whatsNew 업데이트 예정`);
    if (!descOk)
      console.log(
        `  description: ${normalizeForCompare(cur.description).length} -> ${normalizeForCompare(baseline.description).length}`,
      );
    if (!whatsOk)
      console.log(
        `  whatsNew: "${normalizeForCompare(cur.whatsNew).slice(0, 40)}" -> "${normalizeForCompare(baseline.whatsNew).slice(0, 40)}"`,
      );

    if (apply) {
      await sendJson(token, `${API_BASE}/appStoreVersionLocalizations/${cur.id}`, 'PATCH', {
        data: {
          type: 'appStoreVersionLocalizations',
          id: cur.id,
          attributes: {
            ...(descOk ? {} : { description: baseline.description }),
            ...(whatsOk ? {} : { whatsNew: baseline.whatsNew }),
          },
        },
      });
      console.log('  -> patched');
    }
  }
}

async function main() {
  const apply = isApplyMode();
  console.log(`ASC - ar/ru sync (${apply ? 'APPLY' : 'DRY RUN'})\n`);

  const token = createToken();
  console.log('JWT 발급 완료');

  const appInfoId = await getAppInfoIdPreferEditable(token, APP_ID);
  const versionId = await getTargetVersionId(token, APP_ID);

  console.log(`\nApp ID: ${APP_ID}`);
  console.log(`AppInfo ID: ${appInfoId}`);
  console.log(`Target Version: ${TARGET_VERSION_STRING} (id: ${versionId})`);

  await syncAppInfoLocalizations(token, appInfoId, apply);
  await syncVersionLocalizations(token, versionId, apply);

  console.log(`\n${apply ? '완료: 반영했습니다.' : 'DRY RUN 완료: --apply로 실제 반영하세요.'}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
