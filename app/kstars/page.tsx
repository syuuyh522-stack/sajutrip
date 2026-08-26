'use client';

// K스타 매칭 전체 보기 (F-2 더보기) — 궁합·같은 기운 탭, 각 1위 하이라이트 + 2~11위 리스트.
// 'for fun' 놀이 콘텐츠(§5.8) — 점수는 오행 상생상극·분포 유사도 기반 표시용 %.
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK } from '../../lib/ui/elements';
import type { Element } from '../../types/saju';

interface Match { name: string; element: Element; pct: number; image?: string }

function KStarsInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '', year: params.get('year') ?? '',
      month: params.get('month') ?? '', day: params.get('day') ?? '', hour: params.get('hour') ?? '',
    }),
    [params],
  );

  const [tab, setTab] = useState<'soul' | 'twin'>('soul');
  const [data, setData] = useState<{ soulmates: Match[]; twins: Match[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!birth.year) { setError(true); return; }
    fetch(`/api/kstars?${new URLSearchParams(birth).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setData({ soulmates: j.soulmates ?? [], twins: j.twins ?? [] }))
      .catch(() => setError(true));
  }, [birth]);

  const list = data ? (tab === 'soul' ? data.soulmates : data.twins) : [];
  const top = list[0];
  const rest = list.slice(1);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ marginBottom: 16 }}>
        <Link href={{ pathname: '/result', query: birth }} style={{ fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'none' }}>← {t.kstarsPage.back}</Link>
      </header>

      <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: '0 0 4px' }}>
        {t.kstarsPage.title} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted-2)' }}>· {t.kstar.forFun}</span>
      </h1>

      {/* 탭 — 선택 상태 = accent (§1) */}
      <div style={{ display: 'flex', gap: 8, margin: '14px 0 18px' }}>
        {(['soul', 'twin'] as const).map((k) => {
          const on = tab === k;
          return (
            <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={on}
              style={{
                flex: 1, minHeight: 44, borderRadius: 'var(--radius-input)', cursor: 'pointer', fontSize: 14,
                fontWeight: on ? 700 : 500,
                border: `1.5px solid ${on ? 'var(--color-accent)' : 'rgba(185,180,199,.4)'}`,
                background: on ? 'rgba(108,63,224,.08)' : 'var(--color-surface)',
                color: on ? 'var(--color-accent)' : 'var(--color-text-muted)',
                transition: 'all var(--motion-fast)',
              }}>
              {k === 'soul' ? t.kstarsPage.soulTab : t.kstarsPage.twinTab}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{t.result.error}</p>}
      {!error && !data && (
        <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-card-sm)' }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-card-sm)' }} />
        </div>
      )}

      {/* 1위 하이라이트 */}
      {top && (
        <section className="glass" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, marginBottom: 14 }}>
          {top.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={top.image} alt="" width={52} height={52} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto', border: `2px solid ${EL_COLOR[top.element]}` }} />
          ) : (
            <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: '50%', background: EL_COLOR[top.element], flex: '0 0 auto', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#1C1B1F' }}>1</span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{t.kstarsPage.best}</div>
            <div style={{ fontSize: 'var(--text-title-sm)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{top.name}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: EL_INK[top.element], marginTop: 2 }}>{t.elements[top.element]}</div>
          </div>
          <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{top.pct}%</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{t.kstarsPage.match}</div>
          </div>
        </section>
      )}

      {/* 2~11위 */}
      {rest.length > 0 && (
        <section className="glass" style={{ padding: '4px 16px' }}>
          {rest.map((m, i) => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < rest.length - 1 ? '1px solid rgba(185,180,199,.25)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)', width: 18, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flex: '0 0 auto' }}>{i + 2}</span>
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="" width={32} height={32} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }} />
              ) : (
                <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: '50%', background: EL_COLOR[m.element], flex: '0 0 auto' }} />
              )}
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: EL_INK[m.element], flex: '0 0 auto' }}>{t.elements[m.element]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', width: 40, textAlign: 'right', flex: '0 0 auto' }}>{m.pct}%</span>
            </div>
          ))}
        </section>
      )}
      <p style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 16, textAlign: 'center' }}>{t.kstarsPage.photoCredit}</p>
    </main>
  );
}

export default function KStarsPage() {
  return (
    <Suspense fallback={null}>
      <KStarsInner />
    </Suspense>
  );
}
