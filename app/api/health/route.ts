// 외부 API 헬스체크 (수동 점검·모니터링). 실시간 호출, 캐시 없음.
import { NextResponse } from 'next/server';
import { checkApis } from '../../../lib/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await checkApis();
  const allOk = results.every((r) => r.ok);
  return NextResponse.json(
    { checkedAt: new Date().toISOString(), allOk, count: results.length, results },
    { status: allOk ? 200 : 503 },
  );
}
