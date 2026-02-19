/**
 * App Store Connect API - JWT 인증으로 앱 기본 정보 조회
 *
 * 실행: pnpm appstore:list-apps
 * 필요: scripts/app-store-connect/keys/AuthKey_58PL82U37A.p8
 */

import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';

const KEY_ID = '58PL82U37A';
const ISSUER_ID = 'd48e6720-dba1-477b-adcf-f3e0e0566453';
const API_BASE = 'https://api.appstoreconnect.apple.com/v1';

/** 스크립트 기준 keys 폴더 내 .p8 파일 경로 */
function getKeyPath(): string {
  return path.join(__dirname, 'keys', 'AuthKey_58PL82U37A.p8');
}

/** 만료 20분 이내 JWT 생성 (App Store Connect API 사양) */
function createToken(): string {
  const keyPath = getKeyPath();
  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `API 키 파일을 찾을 수 없습니다: ${keyPath}\nkeys 폴더에 AuthKey_58PL82U37A.p8 을 넣어주세요.`,
    );
  }
  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 20 * 60, // 20분
    aud: 'appstoreconnect-v1' as const,
  };
  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    keyid: KEY_ID,
    header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' },
  });
}

/** 앱 목록 API 응답 타입 */
interface AppStoreAppsResponse {
  data: Array<{
    type: string;
    id: string;
    attributes: {
      name?: string;
      bundleId?: string;
      sku?: string;
      primaryLocale?: string;
    };
    relationships?: Record<string, unknown>;
  }>;
  links?: { next?: string };
}

async function fetchApps(token: string): Promise<AppStoreAppsResponse> {
  const res = await fetch(`${API_BASE}/apps?limit=200`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`App Store Connect API 오류 (${res.status}): ${text}`);
  }
  return res.json() as Promise<AppStoreAppsResponse>;
}

async function main(): Promise<void> {
  console.log('App Store Connect API - 앱 목록 조회\n');
  try {
    const token = createToken();
    console.log('JWT 발급 완료 (만료 20분)\n');
    const body = await fetchApps(token);
    const apps = body.data ?? [];
    console.log(`총 ${apps.length}개 앱\n`);
    if (apps.length === 0) {
      console.log('등록된 앱이 없거나 API 권한에 포함된 앱이 없습니다.');
      return;
    }
    for (const app of apps) {
      const attrs = app.attributes ?? {};
      console.log(`- id: ${app.id}`);
      console.log(`  name: ${attrs.name ?? '-'}`);
      console.log(`  bundleId: ${attrs.bundleId ?? '-'}`);
      console.log(`  sku: ${attrs.sku ?? '-'}`);
      console.log(`  primaryLocale: ${attrs.primaryLocale ?? '-'}`);
      console.log('');
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
