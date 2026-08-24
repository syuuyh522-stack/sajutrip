// 계측 이벤트 수집 (§8.4). POC: 서버 콘솔 로그로 남긴다(Phase 2 = GA4/DB).
// sendBeacon(POST)로 들어오며 응답은 204. 개인정보 없음(익명 sid만).
import { NextResponse } from 'next/server';
import { isNorthStar, type TrackEvent } from '../../../lib/analytics/events';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const e = (await request.json()) as TrackEvent;
    if (!e?.name || !e?.sid) return new NextResponse(null, { status: 204 });
    const tag = isNorthStar(e) ? '[track][NORTHSTAR]' : '[track]';
    console.log(tag, JSON.stringify({ name: e.name, sid: e.sid, ts: e.ts, props: e.props ?? {} }));
  } catch {
    // 파싱 실패 무시
  }
  return new NextResponse(null, { status: 204 });
}
