'use client';

// 클라이언트 트래킹 헬퍼 (§8.4). 익명 세션 id를 localStorage에 유지하고
// sendBeacon으로 /api/track에 이벤트를 보낸다(비차단·페이지 이탈에도 전송).
import type { EventName } from './events';

const SID_KEY = 'sajutrip.sid';

function sessionId(): string {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      // crypto.randomUUID 우선, 미지원 시 시각+난수 근사
      sid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return 'anon';
  }
}

export function track(name: EventName, props?: Record<string, string | number | boolean | null>): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({ name, sid: sessionId(), ts: Date.now(), props });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch('/api/track', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } });
    }
  } catch {
    // 전송 실패는 무시 (계측이 UX를 막지 않는다)
  }
}
