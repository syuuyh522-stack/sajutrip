'use client';

// 실시간 API 상태 대시보드 — 심사 '실시간 API 동작' 증빙용 내부 화면. /api/health 폴링.
import { useCallback, useEffect, useState } from 'react';

interface ApiCheck { name: string; ok: boolean; status: number; latencyMs: number; note?: string }
interface Health { checkedAt: string; allOk: boolean; count: number; results: ApiCheck[] }

export default function StatusPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: Health) => setData(j))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(load, 30_000); // 30초마다 실시간 재점검
    return () => clearInterval(id);
  }, [auto, load]);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 22px 60px', minHeight: '100dvh' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted-2)' }}>SajuTrip · Live API status</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: '6px 0 0' }}>외부 API 실시간 점검</h1>
        </div>
        {/* v2 §1: status는 뉴트럴 fill + 아이콘/라벨 (적녹 금지) */}
        {data && (
          <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999, color: 'var(--color-status-text)', background: 'var(--color-status-bg)' }}>
            {data.allOk ? '✓ ALL OK' : '! DEGRADED'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', fontSize: 13, color: 'var(--muted)' }}>
        <button type="button" onClick={load} style={btn}>{loading ? '점검 중…' : '지금 새로고침'}</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> 30초 자동
        </label>
        {data && <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 13 }}>{new Date(data.checkedAt).toLocaleString()}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data?.results.map((r) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderLeft: `4px solid ${r.ok ? 'rgba(28,27,31,.25)' : 'var(--color-error)'}`, borderRadius: 12, padding: '13px 16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
              {r.note && <div style={{ fontSize: 13, color: 'var(--muted-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.note}</div>}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: 62, textAlign: 'right' }}>HTTP {r.status}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: r.latencyMs > 1000 ? 'var(--color-error)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right' }}>{r.latencyMs}ms</span>
          </div>
        ))}
        {!data && !loading && <p style={{ color: 'var(--muted)' }}>불러오지 못했습니다.</p>}
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 24, lineHeight: 1.6 }}>
        각 항목은 실제 외부 API를 서버에서 실시간 호출한 결과입니다(캐시 없음). 공모전 실시간 호출 요건 증빙용.
      </p>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', fontSize: 13, color: 'var(--ink)',
};
