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
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK } from '../../lib/ui/elements';
import { ElementOrb } from '../../components/ElementOrb';
import type { Element, ElementDistribution } from '../../types/saju';

const ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const COLOR = EL_COLOR; // 공식 팔레트

function MyInner() {
  const { t } = useI18n();
  const { birth, signedUp, nickname, bookmarks, collectedCount } = useProfile();
  const { state } = useItinerary();
  const params = useSearchParams();

  // birth: 프로필 우선, 없으면 URL
  const b = birth ?? {
    gender: params.get('gender') ?? '', year: params.get('year') ?? '', month: params.get('month') ?? '', day: params.get('day') ?? '',
  };
  const query = useMemo(() => ({ gender: b.gender, year: b.year, month: b.month, day: b.day }), [b.gender, b.year, b.month, b.day]);

  const [deficient, setDeficient] = useState<Element | null>(null);
  const [dist, setDist] = useState<ElementDistribution | null>(null);
  useEffect(() => {
    if (!b.year) return;
    fetch(`/api/saju?${new URLSearchParams(query).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { setDeficient(j.deficient); setDist(j.distribution); })
      .catch(() => { setDeficient(null); setDist(null); });
  }, [query, b.year]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          {/* 제목은 항상 페이지명 — 닉네임은 보조 인사말로 (닉네임이 제목을 대체하면 맥락 상실) */}
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{t.my.title}</h1>
          {signedUp && nickname && (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{t.my.signedInAs.replace('{name}', nickname)}</p>
          )}
        </div>
        {/* Element Orb 소형 (§5 profile) */}
        {dist && <ElementOrb distribution={dist} size={64} label={ORDER.map((el) => `${t.elements[el]} ${dist[el]}`).join(', ')} />}
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <section>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.my.collected}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {ORDER.map((el) => {
              const on = el === deficient; // 결핍(=채워야 할) 원소 강조
              const got = collectedCount(el); // 체크인으로 수집한 개수 (컨셉: 모으는 여행)
              const name = t.elements[el].split(' ')[0];
              return (
                <div key={el} style={{ flex: 1, borderRadius: 14, overflow: 'hidden', border: on ? `1.5px solid ${EL_INK[el]}` : '1px solid var(--glass-brd)', background: 'var(--color-surface)', position: 'relative' }}>
                  <div aria-hidden="true" style={{ height: 40, background: COLOR[el], opacity: on || got > 0 ? 1 : 0.35 }} />
                  {got > 0 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 10, fontWeight: 700, color: EL_INK[el], background: 'rgba(255,255,255,.85)', borderRadius: 'var(--radius-pill)', padding: '1px 6px', fontVariantNumeric: 'tabular-nums' }}>
                      +{got}
                    </span>
                  )}
                  <div style={{ fontSize: 12, fontWeight: on ? 700 : 500, textAlign: 'center', padding: '6px 0', color: on ? EL_INK[el] : 'var(--color-text-muted)' }}>{name}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '4px 16px' }}>
          {deficient && <Row k={t.my.resonatesWith} v={t.elements[deficient]} />}
          {b.year && <Row k={t.my.birth} v={`${b.year}.${b.month}.${b.day}`} />}
          <Row k={t.my.savedTrip} v={`${state.items.length} ${state.items.length === 1 ? t.my.placeOne : t.my.savedTripDesc}`} last />
        </section>

        {state.items.length > 0 && (
          <Link href={{ pathname: '/plan', query }} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.my.savedTrip}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{state.start || '—'} · {state.items.length} {state.items.length === 1 ? t.my.placeOne : t.my.savedTripDesc}</div>
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

        <Link href={{ pathname: '/signup', query }} style={{ display: 'block', textAlign: 'center', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', fontSize: 15, fontWeight: 600, ...(signedUp ? { border: '1.5px solid rgba(185,180,199,.5)', color: 'var(--color-text)', background: 'var(--color-surface)' } : { background: 'var(--color-fire-strong)', color: '#fff', boxShadow: 'var(--shadow-fab)' }) }}>
          {signedUp ? t.my.editProfile : t.my.signUp}
        </Link>

        {/* 세팅 — 언어 변경 */}
        <section>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.my.settings}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 14px' }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>{t.my.language}</span>
            <LanguageSwitch />
          </div>
        </section>
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
