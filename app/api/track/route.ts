// 계측 이벤트 수집 (§8.4). 개인정보 없음(익명 sid만).
// sendBeacon(POST)으로 들어오며 응답은 항상 204 — 계측이 UX를 막지 않는다.
//
// 적재: Supabase events 테이블. 환경변수가 없으면 콘솔 로그만 남기고 넘어간다
// (키가 안 채워져도 배포가 깨지지 않게).
//
// North Star(지방 포함 완성 일정 수, §8.1) 집계:
//   select count(*) from events
//   where name = 'plan_complete' and (props->>'regionalIncluded')::boolean;
import { NextResponse } from 'next/server';
import { isNorthStar, type TrackEvent } from '../../../lib/analytics/events';
import { insertRow, isStoreEnabled } from '../../../lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const e = (await request.json()) as TrackEvent;
    if (!e?.name || !e?.sid) return new NextResponse(null, { status: 204 });

    // 콘솔은 항상 남긴다 — Vercel 런타임 로그로 즉시 확인 가능(휘발성이라 보조 수단)
    const tag = isNorthStar(e) ? '[track][NORTHSTAR]' : '[track]';
    console.log(tag, JSON.stringify({ name: e.name, sid: e.sid, ts: e.ts, props: e.props ?? {} }));

    if (isStoreEnabled()) {
      // ts는 클라이언트 epoch ms → timestamptz. 비정상값이면 서버 시각으로 대체.
      const ms = typeof e.ts === 'number' && Number.isFinite(e.ts) ? e.ts : Date.now();
      await insertRow('events', {
        name: String(e.name).slice(0, 64),
        sid: String(e.sid).slice(0, 64),
        ts: new Date(ms).toISOString(),
        props: e.props ?? {},
      });
    }
  } catch {
    // 파싱 실패 무시
  }
  return new NextResponse(null, { status: 204 });
}
