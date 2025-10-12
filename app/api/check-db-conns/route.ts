// app/api/check-db-conns/route.ts
export const runtime = 'nodejs';

const KST = 'Asia/Seoul';
const CHANNEL = '#모니터링';
const THRESHOLD_PCT = 0.8;

function now() {
  return new Date().toLocaleString('ko-KR', { timeZone: KST });
}
function log(step: string, extra?: Record<string, unknown>) {
  const base = `[DBConnCheck] ${now()} | ${step}`;
  if (extra) console.log(base, extra);
  else console.log(base);
}
function logWarn(step: string, extra?: Record<string, unknown>) {
  const base = `[DBConnCheck:WARN] ${now()} | ${step}`;
  if (extra) console.warn(base, extra);
}
function logErr(step: string, extra?: Record<string, unknown>) {
  const base = `[DBConnCheck:ERROR] ${now()} | ${step}`;
  if (extra) console.error(base, extra);
  else console.error(base);
}

function b64(s: string) {
  return Buffer.from(String(s)).toString('base64');
}

// 현재 사용 중인 Pooler→DB 커넥션 수 합산
function parseUsedServers(metrics: string): number {
  // 예) pgbouncer_used_servers{...,database="postgres"...} 2
  const re = /pgbouncer_used_servers\{[^}]*database="postgres"[^}]*\}\s+([0-9.]+)/g;
  let sum = 0,
    cnt = 0;
  for (const m of metrics.matchAll(re)) {
    const n = Number(m[1]);
    if (!Number.isNaN(n)) {
      sum += n;
      cnt++;
    }
  }
  log('Parsed used_servers', { matches: cnt, value: sum });
  return sum;
}

// 풀 사이즈(없으면 60)
function parsePoolSize(metrics: string, fallback = 60): number {
  // 예) pgbouncer_databases_pool_size{...,database="postgres"...} 60
  const re = /pgbouncer_databases_pool_size\{[^}]*database="postgres"[^}]*\}\s+([0-9.]+)/g;
  let max = 0,
    cnt = 0;
  for (const m of metrics.matchAll(re)) {
    const n = Number(m[1]);
    if (!Number.isNaN(n)) {
      max = Math.max(max, n);
      cnt++;
    }
  }
  const value = max || fallback;
  log('Parsed pool_size', { matches: cnt, value, fallbackUsed: max === 0 });
  return value;
}

export async function GET() {
  const t0 = Date.now();
  try {
    log('Start');

    // === 1) 환경변수 체크
    const METRICS_URL = process.env.SUPABASE_METRICS_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

    if (!METRICS_URL || !SERVICE_ROLE || !SLACK_BOT_TOKEN) {
      logErr('Missing envs', {
        hasMetricsUrl: !!METRICS_URL,
        hasServiceRole: !!SERVICE_ROLE,
        hasSlackToken: !!SLACK_BOT_TOKEN,
      });
      return new Response('Missing envs', { status: 500 });
    }
    log('Env check OK');

    // === 2) Supabase Metrics 요청
    const auth = `Basic ${b64(`service_role:${SERVICE_ROLE}`)}`;
    log('Fetch metrics: begin', { url: METRICS_URL });
    const tFetch0 = Date.now();
    const res = await fetch(METRICS_URL, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    const msFetch = Date.now() - tFetch0;
    log('Fetch metrics: end', { status: res.status, ms: msFetch });

    if (!res.ok) {
      logErr('Metrics HTTP error', { status: res.status, ms: msFetch });
      return new Response(`metrics ${res.status}`, { status: 502 });
    }

    // === 3) 텍스트 수신 & 파싱
    const tText0 = Date.now();
    const text = await res.text();
    log('Metrics text received', { bytes: text.length, ms: Date.now() - tText0 });

    const connections = parseUsedServers(text);
    const poolSize = parsePoolSize(text, 60);
    const threshold = Math.floor(poolSize * THRESHOLD_PCT);
    log('Computed thresholds', {
      connections,
      poolSize,
      threshold,
      thresholdPct: THRESHOLD_PCT,
    });

    // === 4) 임계치 판단 & 슬랙 전송
    let alerted = false;
    if (connections >= threshold) {
      alerted = true;
      const payload = {
        channel: CHANNEL,
        text:
          `🚨 *DB Connection Alert*\n` +
          `*현재 커넥션:* ${connections}/${poolSize}\n` +
          `*임계치:* ${threshold} (${THRESHOLD_PCT * 100}%)\n` +
          `*시간:* ${now()}`,
        unfurl_links: false,
        unfurl_media: false,
      };

      logWarn('Slack notify: begin', { channel: CHANNEL });
      const tSlack0 = Date.now();
      const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const slackText = await slackRes.text().catch(() => '');
      logWarn('Slack notify: end', {
        status: slackRes.status,
        ok: slackRes.ok,
        ms: Date.now() - tSlack0,
        bodySnippet: slackText.slice(0, 200),
      });
    } else {
      log('Below threshold, skip notify');
    }

    // === 5) 응답
    const result = {
      connections,
      poolSize,
      threshold,
      alerted,
      tookMs: Date.now() - t0,
      ts: new Date().toISOString(),
    };
    log('Done', result);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    logErr('Unhandled error', { name: error.name, message: error.message });
    return new Response('internal error', { status: 500 });
  }
}
