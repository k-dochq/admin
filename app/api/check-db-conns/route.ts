import { prisma } from '../../../lib/prisma';

// app/api/check-db-conns/route.ts
export const runtime = 'nodejs';

const KST = 'Asia/Seoul';
const CHANNEL = '#모니터링';
const THRESHOLD_PCT = 0.8;
// 운영에서 알람 기준 풀 사이즈(대시보드 Pool Size=60)
const POOL_SIZE = 60;

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

type ConnRow = {
  active: number;
  idle: number;
  idle_in_txn: number;
  other: number;
  total: number;
};

export async function GET() {
  const t0 = Date.now();
  try {
    log('Start');

    // === 1) 환경변수 체크 (슬랙 토큰만 필요)
    const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
    if (!SLACK_BOT_TOKEN) {
      logErr('Missing envs', { hasSlackToken: !!SLACK_BOT_TOKEN });
      return new Response('Missing envs', { status: 500 });
    }
    log('Env check OK');

    // === 2) DB 조회 (pg_stat_activity)
    // - client backend만 카운트(autovacuum 등 시스템 백엔드 제외)
    // - 현재 DB만(current_database())
    // - state 분류: active / idle / idle in transaction / 기타
    log('Query pg_stat_activity: begin');
    const tQ0 = Date.now();
    const rows = await prisma.$queryRaw<ConnRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE state = 'active')                                      ::int AS active,
        COUNT(*) FILTER (WHERE state = 'idle')                                        ::int AS idle,
        COUNT(*) FILTER (WHERE state = 'idle in transaction')                         ::int AS idle_in_txn,
        COUNT(*) FILTER (WHERE state NOT IN ('active','idle','idle in transaction')
                         OR state IS NULL)                                            ::int AS other,
        COUNT(*)                                                                      ::int AS total
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND backend_type = 'client backend';
    `;
    const msQ = Date.now() - tQ0;
    const data = rows[0] ?? { active: 0, idle: 0, idle_in_txn: 0, other: 0, total: 0 };
    log('Query pg_stat_activity: end', { ms: msQ, ...data });

    // === 3) 임계값 계산
    const threshold = Math.floor(POOL_SIZE * THRESHOLD_PCT);
    const connections = data.total; // 총 client backend 수 기준으로 판단
    log('Computed thresholds', {
      connections,
      poolSize: POOL_SIZE,
      threshold,
      thresholdPct: THRESHOLD_PCT,
    });

    // === 4) 임계 초과 시 Slack 전송
    let alerted = false;
    if (connections >= threshold) {
      alerted = true;
      const text =
        `🚨 *DB Connection Alert*\n` +
        `*현재 커넥션(total):* ${connections}/${POOL_SIZE}\n` +
        `*세부:* active=${data.active}, idle=${data.idle}, idle_in_txn=${data.idle_in_txn}, other=${data.other}\n` +
        `*임계치:* ${threshold} (${THRESHOLD_PCT * 100}%)\n` +
        `*시간:* ${now()}`;

      logWarn('Slack notify: begin', { channel: CHANNEL });
      const tS0 = Date.now();
      const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: CHANNEL, // 하드코딩
          text,
          unfurl_links: false,
          unfurl_media: false,
        }),
      });
      const body = await slackRes.text().catch(() => '');
      logWarn('Slack notify: end', {
        status: slackRes.status,
        ok: slackRes.ok,
        ms: Date.now() - tS0,
        bodySnippet: body.slice(0, 200),
      });
    } else {
      log('Below threshold, skip notify');
    }

    // === 5) 응답
    const result = {
      ...data,
      connections, // alias
      poolSize: POOL_SIZE,
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
