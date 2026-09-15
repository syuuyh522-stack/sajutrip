// 외부 API 헬스체크 (수동 점검·모니터링). 실시간 호출, 캐시 없음.
// realtimeMode를 같이 내려준다 — 공모전 "모든 외부 API 실시간 호출" 요건이 실제로 켜져 있는지
// 밖에서 확인할 수 있어야 한다(env 값을 추측하지 않기 위해).
import { NextResponse } from 'next/server';
import { checkApis } from '../../../lib/health';
import { isRealtimeMode } from '../../../lib/tour-api/cache';
import { storeStatus } from '../../../lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await checkApis();
  const allOk = results.every((r) => r.ok);
  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      // true = 배치성 데이터도 캐시 우회 실시간 호출 (심사 요건 충족 상태)
      realtimeMode: isRealtimeMode(),
      // 계측 적재 저장소(Supabase) 설정 여부 — 환경변수가 실제로 들어갔는지 밖에서 확인.
      // 키 값은 내보내지 않고 호스트만 노출한다(§6.1).
      store: storeStatus(),
      allOk,
      count: results.length,
      results,
    },
    { status: allOk ? 200 : 503 },
  );
}
