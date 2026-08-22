// 주기적 API 호출 기록 (공모전 요건 §1). Vercel Cron이 정해진 주기로 호출 →
// 각 외부 API를 실호출하고 구조화된 로그를 남긴다(Vercel 함수 로그에 기록으로 남음).
import { NextResponse } from 'next/server';
import { checkApis } from '../../../../lib/health';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel Cron은 CRON_SECRET을 Authorization 헤더로 보냄. 설정돼 있으면 검증.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const results = await checkApis();
  const allOk = results.every((r) => r.ok);
  const record = {
    at: new Date().toISOString(),
    allOk,
    apis: results.map((r) => ({ name: r.name, ok: r.ok, status: r.status, ms: r.latencyMs })),
  };
  // 주기적 호출 기록 — Vercel 로그에 남는다
  console.log('[api-ping]', JSON.stringify(record));

  return NextResponse.json(record, { status: allOk ? 200 : 503 });
}
