/**
 * App Store Connect API - 메타데이터 동기화
 *
 * 목표:
 * - App Info Localizations(앱 레벨): name, subtitle 를 baseline과 동기화
 * - App Store Version Localizations(버전 레벨, 1.5.6113): description, whatsNew 를 baseline과 동기화
 * - baseline에 있지만 없는 로케일은 생성(단, 관리 대상 6개 로케일만)
 *
 * 기본은 DRY RUN (변경사항만 출력)
 * 실제 반영: --apply
 *
 * 실행:
 *   npx tsx scripts/app-store-connect/sync-metadata.ts
 *   npx tsx scripts/app-store-connect/sync-metadata.ts --apply
 */

import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import {
  METADATA_BASELINE,
  apiLocaleToBaselineKey,
  type LocaleMetadata,
} from '../../lib/app-store-connect/baseline';

const KEY_ID = '58PL82U37A';
const ISSUER_ID = 'd48e6720-dba1-477b-adcf-f3e0e0566453';
const API_BASE = 'https://api.appstoreconnect.apple.com/v1';

const APP_ID = '6502036150';
const TARGET_VERSION_STRING = '1.5.6113';

// 이번 동기화 대상(6개 로케일만)
const MANAGED_API_LOCALES = ['ko', 'en-US', 'ja', 'th', 'hi', 'zh-Hant'] as const;
type ManagedApiLocale = (typeof MANAGED_API_LOCALES)[number];

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

function normalizeForCompare(s: string): string {
  return (s ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n+/g, '\n')
    .trim();
}

function stringsMatch(expected: string, actual: string): boolean {
  return normalizeForCompare(expected) === normalizeForCompare(actual);
}

function mustBaselineFor(apiLocale: string): LocaleMetadata | null {
  const key = apiLocaleToBaselineKey(apiLocale);
  const baseline = METADATA_BASELINE[key];
  if (!baseline) return null;
  return baseline;
}

function isApplyMode(): boolean {
  return process.argv.includes('--apply');
}

async function fetchJson<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 오류 (${res.status}): ${text}`);
  }
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 오류 (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

function isInvalidState409(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('API 오류 (409)') ||
    msg.includes('INVALID_STATE') ||
    msg.includes('can not be modified in the current state')
  );
}

// ---------- API Types ----------

interface AppInfosResponse {
  data: Array<{
    type: 'appInfos';
    id: string;
    attributes?: {
      // 최신 문서 기준: appStoreState는 deprecated, state를 사용  [oai_citation:1‡Apple Developer](https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-3-7-release-notes?utm_source=chatgpt.com)
      state?: string;
      appStoreState?: string; // 혹시 남아있는 경우 대비
    };
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
    attributes: { versionString?: string; appStoreState?: string; platform?: string };
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

// ---------- Paging ----------

async function fetchAllPages<T extends { data: unknown[]; links?: { next?: string } }>(
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

// ---------- Get IDs ----------

/**
 * 중요:
 * appInfos는 "현재 라이브"와 "다음 버전과 함께 라이브될" 2개가 존재할 수 있음.  [oai_citation:2‡Apple Developer](https://developer.apple.com/documentation/appstoreconnectapi/get-v1-apps-_id_-appinfos?utm_source=chatgpt.com)
 * 둘을 state(과거 appStoreState)로 구분하라고 문서에 안내.  [oai_citation:3‡Apple Developer](https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-3-7-release-notes?utm_source=chatgpt.com)
 *
 * 따라서 [0] 고정 선택 대신:
 * - state가 편집 가능해 보이는 것을 우선 선택
 * - 없으면 fallback으로 첫 번째
 */
async function getEditableAppInfoId(token: string, appId: string): Promise<string> {
  const url = `${API_BASE}/apps/${appId}/appInfos?limit=200&fields[appInfos]=state,appStoreState`;
  const res = await fetchJson<AppInfosResponse>(token, url);
  const list = res.data ?? [];
  if (list.length === 0) throw new Error('appInfos가 없습니다.');

  // 디버그 출력 (상태 확인용)
  const states = list.map((x) => ({
    id: x.id,
    state: x.attributes?.state ?? x.attributes?.appStoreState ?? '(none)',
  }));
  console.log('AppInfos states:', states);

  // "편집 가능할 확률이 높은" 상태를 우선 선택 (문서에 전체 enum을 여기서 확정하기 어려워서 안전하게 넓게 잡음)
  const preferredStateKeywords = [
    'PREPARE', // PREPARE_FOR_SUBMISSION 류
    'DEVELOPER', // DEVELOPER_REJECTED 등
    'REJECT', // REJECTED / METADATA_REJECTED 등
    'WAITING', // WAITING_FOR_REVIEW 등
    'IN_REVIEW',
    'PENDING',
    'PROCESSING',
  ];

  const preferred = list.find((x) => {
    const s = (x.attributes?.state ?? x.attributes?.appStoreState ?? '').toUpperCase();
    return preferredStateKeywords.some((k) => s.includes(k));
  });

  return (preferred ?? list[0]).id;
}

async function getTargetVersionId(token: string, appId: string): Promise<string> {
  const res = await fetchJson<AppStoreVersionsResponse>(
    token,
    `${API_BASE}/apps/${appId}/appStoreVersions?limit=200&filter[platform]=IOS`,
  );
  const list = res.data ?? [];
  const match = list.find((v) => (v.attributes?.versionString ?? '') === TARGET_VERSION_STRING);
  if (!match) {
    const versions = list
      .map((v) => `${v.attributes?.versionString ?? v.id}(${v.attributes?.appStoreState ?? '-'})`)
      .join(', ');
    throw new Error(`대상 버전 ${TARGET_VERSION_STRING}을 찾지 못했습니다. 현재: ${versions}`);
  }
  return match.id;
}

// ---------- Sync: AppInfoLocalizations ----------

async function syncAppInfoLocalizations(
  token: string,
  appInfoId: string,
  apply: boolean,
): Promise<void> {
  const existing = await fetchAllPages<AppInfoLocalizationsResponse>(
    token,
    `${API_BASE}/appInfos/${appInfoId}/appInfoLocalizations?limit=200`,
  );

  const byLocale = new Map<string, { id: string; name: string; subtitle: string }>();
  for (const loc of existing) {
    const apiLocale = (loc as any).attributes?.locale?.trim?.() ?? '';
    if (!apiLocale) continue;
    byLocale.set(apiLocale, {
      id: (loc as any).id,
      name: (loc as any).attributes?.name ?? '',
      subtitle: (loc as any).attributes?.subtitle ?? '',
    });
  }

  console.log('=== App Info Localizations (name/subtitle) ===');
  console.log('Using AppInfo ID:', appInfoId);
  console.log('Existing locales:', Array.from(byLocale.keys()).sort().join(', ') || '(none)');
  console.log('');

  for (const apiLocale of MANAGED_API_LOCALES) {
    const baseline = mustBaselineFor(apiLocale);
    if (!baseline) {
      console.log(`[SKIP][${apiLocale}] baseline 없음 (METADATA_BASELINE / 매핑 확인 필요)`);
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
              attributes: {
                locale: apiLocale,
                name: baseline.name,
                subtitle: baseline.subtitle,
              },
              relationships: {
                appInfo: { data: { type: 'appInfos', id: appInfoId } },
              },
            },
          });
          console.log('  -> created');
        } catch (err) {
          if (isInvalidState409(err)) {
            console.log(
              '  -> [SKIP] 현재 state에서는 생성/수정이 잠겨 있습니다 (409 INVALID_STATE).',
            );
          } else {
            throw err;
          }
        }
      }
      console.log('');
      continue;
    }

    const nameOk = stringsMatch(baseline.name, cur.name);
    const subtitleOk = stringsMatch(baseline.subtitle, cur.subtitle);

    if (nameOk && subtitleOk) {
      console.log(`[OK][${apiLocale}] name/subtitle already match`);
      continue;
    }

    console.log(`[PATCH][${apiLocale}] name/subtitle 업데이트 예정`);
    if (!nameOk) console.log(`  name: "${cur.name}" -> "${baseline.name}"`);
    if (!subtitleOk) console.log(`  subtitle: "${cur.subtitle}" -> "${baseline.subtitle}"`);

    if (apply) {
      try {
        await sendJson(token, `${API_BASE}/appInfoLocalizations/${cur.id}`, 'PATCH', {
          data: {
            type: 'appInfoLocalizations',
            id: cur.id,
            attributes: {
              ...(nameOk ? {} : { name: baseline.name }),
              ...(subtitleOk ? {} : { subtitle: baseline.subtitle }),
            },
          },
        });
        console.log('  -> patched');
      } catch (err) {
        if (isInvalidState409(err)) {
          const apiDetail = err instanceof Error ? err.message : String(err);
          console.log(
            '  -> [SKIP] 현재 state에서는 name/subtitle 수정이 불가합니다(409). ' +
              '대부분 "라이브 AppInfo"를 잡았거나, 편집 가능 상태가 아닌 AppInfo입니다. ' +
              'AppInfos states 로그를 확인하고 next-version AppInfo가 선택됐는지 확인하세요.',
          );
          console.log('  -> API 응답:', apiDetail);
        } else {
          throw err;
        }
      }
    }
    console.log('');
  }
}

// ---------- Sync: AppStoreVersionLocalizations ----------

async function syncAppStoreVersionLocalizations(
  token: string,
  versionId: string,
  apply: boolean,
): Promise<void> {
  const existing = await fetchAllPages<AppStoreVersionLocalizationsResponse>(
    token,
    `${API_BASE}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`,
  );

  const byLocale = new Map<string, { id: string; description: string; whatsNew: string }>();
  for (const loc of existing) {
    const apiLocale = (loc as any).attributes?.locale?.trim?.() ?? '';
    if (!apiLocale) continue;
    byLocale.set(apiLocale, {
      id: (loc as any).id,
      description: (loc as any).attributes?.description ?? '',
      whatsNew: (loc as any).attributes?.whatsNew ?? '',
    });
  }

  console.log('=== App Store Version Localizations (description/whatsNew) ===');
  console.log('Using Version ID:', versionId);
  console.log('Existing locales:', Array.from(byLocale.keys()).sort().join(', ') || '(none)');
  console.log('');

  for (const apiLocale of MANAGED_API_LOCALES) {
    const baseline = mustBaselineFor(apiLocale);
    if (!baseline) {
      console.log(`[SKIP][${apiLocale}] baseline 없음 (METADATA_BASELINE / 매핑 확인 필요)`);
      continue;
    }

    const cur = byLocale.get(apiLocale);
    if (!cur) {
      console.log(`[CREATE][${apiLocale}] description/whatsNew 생성 예정`);
      console.log(
        `  description(head): ${normalizeForCompare(baseline.description).slice(0, 80)}...`,
      );
      console.log(`  whatsNew(head): ${normalizeForCompare(baseline.whatsNew).split('\n')[0]}...`);

      if (apply) {
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
      }
      console.log('');
      continue;
    }

    const descOk = stringsMatch(baseline.description, cur.description);
    const whatsOk = stringsMatch(baseline.whatsNew, cur.whatsNew);

    if (descOk && whatsOk) {
      console.log(`[OK][${apiLocale}] description/whatsNew already match`);
      continue;
    }

    console.log(`[PATCH][${apiLocale}] description/whatsNew 업데이트 예정`);
    if (!descOk) {
      console.log(
        `  description: (current ${normalizeForCompare(cur.description).length} chars) -> (baseline ${normalizeForCompare(baseline.description).length} chars)`,
      );
    }
    if (!whatsOk) {
      console.log(
        `  whatsNew: "${normalizeForCompare(cur.whatsNew).slice(0, 60)}" -> "${normalizeForCompare(baseline.whatsNew).slice(0, 60)}"`,
      );
    }

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
    console.log('');
  }
}

// ---------- main ----------

async function main(): Promise<void> {
  const apply = isApplyMode();
  console.log(`App Store Connect API - 메타데이터 동기화 (${apply ? 'APPLY' : 'DRY RUN'})\n`);

  try {
    const token = createToken();
    console.log('JWT 발급 완료\n');

    const appInfoId = await getEditableAppInfoId(token, APP_ID);
    const versionId = await getTargetVersionId(token, APP_ID);

    console.log(`App ID: ${APP_ID}`);
    console.log(`Chosen AppInfo ID: ${appInfoId}`);
    console.log(`Target Version: ${TARGET_VERSION_STRING} (id: ${versionId})`);
    console.log(`Managed locales: ${MANAGED_API_LOCALES.join(', ')}`);
    console.log('');

    await syncAppInfoLocalizations(token, appInfoId, apply);
    console.log('');
    await syncAppStoreVersionLocalizations(token, versionId, apply);

    console.log('');
    console.log(
      apply ? '완료: API에 반영했습니다.' : 'DRY RUN 완료: --apply 를 붙이면 실제 반영됩니다.',
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
