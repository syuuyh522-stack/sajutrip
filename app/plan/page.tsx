'use client';

// F-5 일정 — 결핍 원소 pre-fill(고정) + 여행일자 + 일자별 담기. (PRD F-5)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { useItinerary } from '../../i18n/ItineraryProvider';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import type { Element } from '../../types/saju';

const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B',
};

function PlanInner() {
  const { t } = useI18n();
  const { state, dayCount, setDates, setItemDay, removeItem } = useItinerary();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '', year: params.get('year') ?? '',
      month: params.get('month') ?? '', day: params.get('day') ?? '',
    }),
    [params],
  );

  const [deficient, setDeficient] = useState<Element | null>(null);
  useEffect(() => {
    if (!birth.year) return;
    const qs = new URLSearchParams(birth);
    fetch(`/api/saju?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setDeficient(j.deficient))
      .catch(() => setDeficient(null));
  }, [birth]);

  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link href={{ pathname: '/explore', query: birth }} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.plan.back}</Link>
        <LanguageSwitch />
      </header>

      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 16px' }}>{t.plan.title}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 결핍 원소 pre-fill (고정) */}
        {deficient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--accent-soft)', border: '1px solid #c9d6e4', borderRadius: 12, padding: '12px 14px' }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: ELEMENT_COLOR[deficient], color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, flex: '0 0 auto' }}>
              {t.elements[deficient].split(' ')[1] ?? t.elements[deficient]}
            </span>
            <span style={{ flex: 1, fontSize: 13 }}>{t.plan.target}: {t.elements[deficient]}</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>🔒 {t.plan.locked}</span>
          </div>
        )}

        {/* 여행 일자 (필수) */}
        <div>
          <label style={{ display: 'block', fontSize: 12, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{t.plan.dates}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="date" value={state.start} onChange={(e) => setDates(e.target.value, state.end)} aria-label={t.plan.start} style={dateInput} />
            <input type="date" value={state.end} min={state.start || undefined} onChange={(e) => setDates(state.start, e.target.value)} aria-label={t.plan.end} style={dateInput} />
          </div>
        </div>

        {/* 일자별 담긴 장소 */}
        {state.items.length === 0 && <p style={{ color: 'var(--muted-2)', fontSize: 14 }}>{t.plan.empty}</p>}

        {state.items.length > 0 &&
          days.map((d) => {
            const dayItems = state.items.filter((it) => it.day === d);
            return (
              <section key={d}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{d}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t.plan.day} {d}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dayItems.map((it) => (
                    <div key={it.contentId} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
                      {it.element && <span style={{ width: 8, height: 34, borderRadius: 4, background: ELEMENT_COLOR[it.element], flex: '0 0 auto' }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.region}</div>
                      </div>
                      <select value={it.day} onChange={(e) => setItemDay(it.contentId, Number(e.target.value))} aria-label={t.plan.day} style={daySelect}>
                        {days.map((n) => <option key={n} value={n}>{t.plan.day} {n}</option>)}
                      </select>
                      <button type="button" onClick={() => removeItem(it.contentId)} aria-label={t.plan.remove} style={{ border: 0, background: 'transparent', color: 'var(--muted-2)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
                    </div>
                  ))}
                  {dayItems.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted-2)', margin: 0 }}>—</p>}
                </div>
              </section>
            );
          })}

        {state.items.length > 0 && <p style={{ fontSize: 12, color: 'var(--muted-2)' }}>{t.plan.nearby}</p>}

        {state.items.length > 0 && (
          <Link
            href={{ pathname: '/share', query: birth }}
            style={{ display: 'block', textAlign: 'center', padding: '16px 18px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
          >
            {t.plan.finish} →
          </Link>
        )}
      </div>
    </main>
  );
}

const dateInput: React.CSSProperties = {
  flex: 1, padding: 12, borderRadius: 11, border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', background: '#fff',
};
const daySelect: React.CSSProperties = {
  border: '1px solid var(--line)', borderRadius: 8, padding: '6px 8px', fontSize: 12, color: 'var(--ink)', background: '#fff', flex: '0 0 auto',
};

export default function PlanPage() {
  return (
    <Suspense fallback={null}>
      <PlanInner />
    </Suspense>
  );
}
