'use client';

// F-5 P1 검색 — 장소·지역 검색 + 검색홈(최근·이번주 축제 placeholder). (PRD 검색홈)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { BottomNav } from '../../components/BottomNav';
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK } from '../../lib/ui/elements';
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';

const ELEMENT_COLOR = EL_COLOR; // 공식 팔레트 (fill 전용, §1.1)
const RECENT = ['온천', '템플스테이', '숲치유'];

function SearchInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({ gender: params.get('gender') ?? '', year: params.get('year') ?? '', month: params.get('month') ?? '', day: params.get('day') ?? '' }),
    [params],
  );
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults(null);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${locale}`)
        .then((r) => r.json())
        .then((j) => setResults(j.places ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(id);
  }, [q, locale]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: 0 }}>{t.search.title}</h1>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.search.placeholder}
        aria-label={t.search.title}
        style={{ width: '100%', minHeight: 44, padding: '13px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(185,180,199,.4)', background: 'var(--color-surface)', fontSize: 14, color: 'var(--color-text)', outline: 'none' }}
      />

      {/* 검색어 없을 때 = 검색홈 */}
      {results === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
          <section>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t.search.recent}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RECENT.map((r) => (
                <button key={r} type="button" onClick={() => setQ(r)} style={chip}>{r}</button>
              ))}
            </div>
          </section>
          <section>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t.search.festivals}</div>
            <p style={{ fontSize: 12.5, color: 'var(--muted-2)', margin: 0 }}>축제 API 연동 예정 (Phase 2).</p>
          </section>
        </div>
      )}

      {/* 검색 결과 */}
      {results !== null && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && <p style={{ color: 'var(--muted)' }}>…</p>}
          {!loading && results.length === 0 && <p style={{ color: 'var(--muted)' }}>{t.search.empty}</p>}
          {results.map((p) => (
            <Link key={p.contentId} href={{ pathname: `/place/${p.contentId}`, query: { ...birth, ...(p.primaryElement ? { element: p.primaryElement } : {}) } }} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 14, padding: 10 }}>
                <div style={{ width: 54, height: 54, borderRadius: 12, flex: '0 0 auto', background: p.image ? `center/cover no-repeat url(${p.image})` : (p.primaryElement ? ELEMENT_COLOR[p.primaryElement] : '#E2E8F0') }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.region}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <BottomNav />
    </main>
  );
}

const chip: React.CSSProperties = {
  fontSize: 13, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)', background: '#fff', color: 'var(--muted)', cursor: 'pointer',
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
