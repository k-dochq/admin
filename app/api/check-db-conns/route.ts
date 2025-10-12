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
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] DB Connection Check 시작`);

  try {
    // 1. Supabase Metrics 가져오기
    console.log(`[${new Date().toISOString()}] Supabase 메트릭스 요청 시작`);
    const auth = Buffer.from(`service_role:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).toString(
      'base64',
    );

    const res = await fetch(process.env.SUPABASE_METRICS_URL!, {
      headers: { Authorization: `Basic ${auth}` },
      cache: 'no-store',
    });

    console.log(`[${new Date().toISOString()}] Supabase 메트릭스 응답 상태: ${res.status}`);

    if (!res.ok) {
      console.error(
        `[${new Date().toISOString()}] 메트릭스 요청 실패: ${res.status} ${res.statusText}`,
      );
      return new Response(`metrics fetch failed: ${res.status}`, { status: 502 });
    }

    const text = await res.text();
    console.log(`[${new Date().toISOString()}] 메트릭스 데이터 크기: ${text.length} bytes`);

    const connections = parseMaxConnections(text);
    console.log(`[${new Date().toISOString()}] 파싱된 최대 연결 수: ${connections}`);

    // 2. 임계값 하드코딩 설정
    const POOL_SIZE = 60;
    const THRESHOLD_PCT = 0.8;
    const THRESHOLD = Math.floor(POOL_SIZE * THRESHOLD_PCT);

    console.log(
      `[${new Date().toISOString()}] 모니터링 설정 - 풀 크기: ${POOL_SIZE}, 임계치: ${THRESHOLD} (${THRESHOLD_PCT * 100}%)`,
    );

    // 3. 임계치 초과 시 Slack 알림 전송
    if (connections >= THRESHOLD) {
      console.warn(
        `[${new Date().toISOString()}] 🚨 임계치 초과! 현재: ${connections}, 임계치: ${THRESHOLD}`,
      );

      const slackToken = process.env.SLACK_BOT_TOKEN!;
      const channel = '#모니터링';
      const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

      const message = {
        channel,
        text: `🚨 *DB Connection Alert*\n\n*현재 커넥션:* ${connections}/${POOL_SIZE}\n*임계치:* ${THRESHOLD} (${THRESHOLD_PCT * 100}%)\n*발생 시각:* ${now}`,
        unfurl_links: false,
        unfurl_media: false,
      };

      console.log(`[${new Date().toISOString()}] Slack 알림 전송 시작 - 채널: ${channel}`);

      const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (slackRes.ok) {
        const slackResult = await slackRes.json();
        console.log(
          `[${new Date().toISOString()}] Slack 알림 전송 성공: ${slackResult.ok ? 'OK' : 'FAILED'}`,
        );
      } else {
        console.error(
          `[${new Date().toISOString()}] Slack 알림 전송 실패: ${slackRes.status} ${slackRes.statusText}`,
        );
      }
    } else {
      console.log(
        `[${new Date().toISOString()}] ✅ 연결 수 정상 - 현재: ${connections}, 임계치: ${THRESHOLD}`,
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`[${new Date().toISOString()}] DB Connection Check 완료 - 소요시간: ${duration}ms`);

    return new Response(
      JSON.stringify({
        connections,
        poolSize: POOL_SIZE,
        threshold: THRESHOLD,
        alerted: connections >= THRESHOLD,
        ts: new Date().toISOString(),
        duration: `${duration}ms`,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(
      `[${new Date().toISOString()}] DB Connection Check 오류 발생 - 소요시간: ${duration}ms`,
      error,
    );

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        ts: new Date().toISOString(),
        duration: `${duration}ms`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
