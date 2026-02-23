import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';

const KEY_ID = process.env.APP_STORE_CONNECT_KEY_ID ?? '58PL82U37A';
const ISSUER_ID = process.env.APP_STORE_CONNECT_ISSUER_ID ?? 'd48e6720-dba1-477b-adcf-f3e0e0566453';

export const API_BASE = 'https://api.appstoreconnect.apple.com/v1';

const P8_KEY_PATH = path.join(process.cwd(), 'keys', 'app-store-connect', `AuthKey_${KEY_ID}.p8`);

function getPrivateKey(): string {
  if (!fs.existsSync(P8_KEY_PATH)) {
    throw new Error(
      `App Store Connect API 키를 찾을 수 없습니다. ${P8_KEY_PATH} 에 .p8 파일을 넣어주세요.`,
    );
  }
  return fs.readFileSync(P8_KEY_PATH, 'utf8');
}

export function createAppStoreConnectToken(): string {
  const privateKey = getPrivateKey();
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

export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
