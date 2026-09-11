// 외부 API 호출 캐시 정책 (CLAUDE.md §6.5 · 공모전 실시간 요건).
//
// 공모전 조건: "심사 기간 동안 모든 외부 API는 실시간 호출로 동작해야 한다(배치 캐시만으로
// 응답하면 안 됨)." 심사위원이 언제 들어올지 알 수 없으므로 **실시간이 기본값**이다.
// 캐시를 쓰려면 `REALTIME_API_MODE=false`로 명시적으로 꺼야 한다.
//
// 기본값을 이렇게 뒤집은 이유: 예전 구현은 `=== 'true'`라 env가 비거나 오타가 나면
// 조용히 캐시 모드로 떨어졌다. 요건을 못 지키는 쪽이 기본값이면 안 된다.

/** 캐시 우회(실시간) 모드인가 — 기본 true, `REALTIME_API_MODE=false`일 때만 false */
export function isRealtimeMode(): boolean {
  return process.env.REALTIME_API_MODE !== 'false';
}

/**
 * 배치성 데이터(웰니스·일반관광 등)의 fetch 옵션.
 * 실시간 모드면 캐시 우회, 아니면 주어진 초만큼 revalidate.
 */
export function fetchInit(revalidateSeconds: number): RequestInit {
  return isRealtimeMode()
    ? { cache: 'no-store' }
    : { next: { revalidate: revalidateSeconds } };
}
