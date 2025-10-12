export const runtime = 'nodejs';

function parseMaxConnections(metrics: string) {
  let max = 0;
  for (const raw of metrics.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (!line.includes('connections')) continue;
    const parts = line.split(/\s+/);
    const num = Number(parts[parts.length - 1]);
    if (!Number.isNaN(num)) max = Math.max(max, num);
  }
  return max;
}

export async function GET() {
  // 1. Supabase Metrics 가져오기
  const auth = Buffer.from(`service_role:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).toString(
    'base64',
  );

  const res = await fetch(process.env.SUPABASE_METRICS_URL!, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return new Response(`metrics fetch failed: ${res.status}`, { status: 502 });
  }

  const text = await res.text();
  const connections = parseMaxConnections(text);

  // 2. 임계값 하드코딩 설정
  const POOL_SIZE = 60;
  const THRESHOLD_PCT = 0.8;
  const THRESHOLD = Math.floor(POOL_SIZE * THRESHOLD_PCT);

  // 3. 임계치 초과 시 Slack 알림 전송
  if (connections >= THRESHOLD) {
    const slackToken = process.env.SLACK_BOT_TOKEN!;
    const channel = '#모니터링';
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const message = {
      channel,
      text: `🚨 *DB Connection Alert*\n\n*현재 커넥션:* ${connections}/${POOL_SIZE}\n*임계치:* ${THRESHOLD} (${THRESHOLD_PCT * 100}%)\n*발생 시각:* ${now}`,
      unfurl_links: false,
      unfurl_media: false,
    };

    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  return new Response(
    JSON.stringify({
      connections,
      poolSize: POOL_SIZE,
      threshold: THRESHOLD,
      alerted: connections >= THRESHOLD,
      ts: new Date().toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
