'use client';

// 마이페이지 (P1) — 오행 수집·회원정보·저장 일정·찜. (PRD 마이페이지)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { useProfile } from '../../i18n/ProfileProvider';
import { useItinerary } from '../../i18n/ItineraryProvider';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import { BottomNav } from '../../components/BottomNav';
import type { Element } from '../../types/saju';

const ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const GLYPH: Record<Element, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
const COLOR: Record<Element, string> = { wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B' };

function MyInner() {
  const { t } = useI18n();
  const { birth, signedUp, nickname, bookmarks } = useProfile();
  const { state } = useItinerary();
  const params = useSearchParams();

  // birth: 프로필 우선, 없으면 URL
  const b = birth ?? {
    gender: params.get('gender') ?? '', year: params.get('year') ?? '', month: params.get('month') ?? '', day: params.get('day') ?? '',
  };
  const query = useMemo(() => ({ gender: b.gender, year: b.year, month: b.month, day: b.day }), [b.gender, b.year, b.month, b.day]);

  const [deficient, setDeficient] = useState<Element | null>(null);
  useEffect(() => {
    if (!b.year) return;
    fetch(`/api/saju?${new URLSearchParams(query).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setDeficient(j.deficient))
      .catch(() => setDeficient(null));
  }, [query, b.year]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{signedUp && nickname ? nickname : t.my.title}</h1>
        <LanguageSwitch />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <section>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.my.collected}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ORDER.map((el) => {
              const on = el === deficient;
              return (
                <div key={el} style={{ flex: 1, aspectRatio: '1', borderRadius: 12, display: 'grid', placeItems: 'center', fontFamily: 'serif', fontSize: 18, color: on ? '#fff' : 'var(--muted-2)', background: on ? COLOR[el] : '#F1F5F9', border: on ? '0' : '1px solid var(--line)' }}>
                  {GLYPH[el]}
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '4px 16px' }}>
          {deficient && <Row k={t.my.resonatesWith} v={t.elements[deficient]} />}
          {b.year && <Row k={t.my.birth} v={`${b.year}.${b.month}.${b.day}`} />}
          <Row k={t.my.savedTrip} v={`${state.items.length} ${t.my.savedTripDesc}`} last />
        </section>

        {state.items.length > 0 && (
          <Link href={{ pathname: '/plan', query }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.my.savedTrip}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{state.start || '—'} · {state.items.length} {t.my.savedTripDesc}</div>
            </div>
          </Link>
        )}

        <section>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.my.bookmarks}</div>
          {bookmarks.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: 0 }}>{t.my.noBookmarks}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookmarks.map((bm) => (
              <Link key={bm.contentId} href={{ pathname: `/place/${bm.contentId}`, query: { ...query, ...(bm.element ? { element: bm.element } : {}) } }} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
                  {bm.element && <span style={{ width: 8, height: 30, borderRadius: 4, background: COLOR[bm.element], flex: '0 0 auto' }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bm.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{bm.region}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Link href={{ pathname: '/signup', query }} style={{ display: 'block', textAlign: 'center', padding: '15px 18px', borderRadius: 14, textDecoration: 'none', fontSize: 15, fontWeight: 600, ...(signedUp ? { border: '1px solid var(--line)', color: 'var(--ink)', background: '#fff' } : { background: 'var(--accent)', color: '#fff' }) }}>
          {signedUp ? t.my.editProfile : t.my.signUp}
        </Link>
      </div>
      <BottomNav />
    </main>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', fontSize: 14, borderBottom: last ? '0' : '1px solid var(--line)' }}>
      <span style={{ color: 'var(--muted)' }}>{k}</span>
      <span style={{ fontFamily: 'var(--mono)' }}>{v}</span>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={null}>
      <MyInner />
    </Suspense>
  );
}
