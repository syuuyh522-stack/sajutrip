// Supabase(PostgREST) 최소 클라이언트 — 서버 전용 (CLAUDE.md §6.1).
//
// SDK를 쓰지 않는다. CLAUDE.md §2가 "읽기는 PostgREST fetch"로 정해뒀고,
// 계측 적재는 테이블 하나에 INSERT 한 번이라 fetch로 충분하다(의존성 0).
//
// 키는 반드시 secret 키(sb_secret_...)여야 한다. publishable 키(sb_publishable_...)는
// 브라우저에 노출되도록 설계된 공개 키라 RLS에 걸리고, RLS를 끄면 누구나 쓰기가 된다.
const URL_ENV = 'SUPABASE_URL';
const KEY_ENV = 'SUPABASE_SECRET_KEY';

/** 환경변수가 갖춰졌는가 — 없으면 호출부가 조용히 건너뛴다(배포는 깨지지 않는다) */
export function isStoreEnabled(): boolean {
  return Boolean(process.env[URL_ENV] && process.env[KEY_ENV]);
}

/** 설정 상태만 노출 (키 값은 절대 내보내지 않는다 — §6.1) */
export function storeStatus(): { configured: boolean; url: string | null } {
  const url = process.env[URL_ENV] ?? null;
  return { configured: isStoreEnabled(), url: url ? new global.URL(url).host : null };
}

/** 느린 응답이 sendBeacon 경로를 붙잡지 않도록 상한을 둔다 */
const TIMEOUT_MS = 3000;

/**
 * 한 건 INSERT. 성공 여부를 boolean으로 돌려주고 예외는 던지지 않는다 —
 * 계측 실패가 사용자 요청을 깨뜨리면 안 된다.
 */
export async function insertRow(table: string, row: Record<string, unknown>): Promise<boolean> {
  if (!isStoreEnabled()) return false;
  const base = process.env[URL_ENV] as string;
  const key = process.env[KEY_ENV] as string;
  try {
    const res = await fetch(`${base}/rest/v1/${encodeURIComponent(table)}`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn('[store] insert 실패', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[store] insert 예외', e instanceof Error ? e.message : e);
    return false;
  }
}
