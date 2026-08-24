'use client';

// F-4 PDP — 장소 상세: 공명 근거 + 혼잡/여유 시간(demo) + 예약하기(딥링크 later). (PRD F-4)
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useI18n } from '../../../i18n/LanguageProvider';
import { useItinerary } from '../../../i18n/ItineraryProvider';
import { useProfile } from '../../../i18n/ProfileProvider';
import { LanguageSwitch } from '../../../components/LanguageSwitch';
import { track } from '../../../lib/analytics/track';
import type { Element } from '../../../types/saju';
import type { Place } from '../../../types/place';

const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B',
};
function isElement(v: string | null): v is Element {
  return v === 'wood' || v === 'fire' || v === 'earth' || v === 'metal' || v === 'water';
}
// 혼잡/여유 demo 막대 (실시간 집중률 API 연동 전)
const CROWD = [40, 30, 55, 70, 95, 88, 60];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlacePage() {
  const { t, locale } = useI18n();
  const { addItem, hasItem } = useItinerary();
  const { toggleBookmark, hasBookmark } = useProfile();
  const routeParams = useParams<{ contentId: string }>();
  const search = useSearchParams();

  const backQuery = useMemo(() => {
    const q: Record<string, string> = {};
    for (const k of ['gender', 'year', 'month', 'day']) {
      const v = search.get(k);
      if (v) q[k] = v;
    }
    return q;
  }, [search]);

  const [place, setPlace] = useState<Place | null>(null);
  const [notFound, setNotFound] = useState(false);

  const queryEl = search.get('element');

  useEffect(() => {
    const elParam = queryEl ? `&element=${queryEl}` : '';
    fetch(`/api/places/${routeParams.contentId}?lang=${locale}${elParam}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { setPlace(j.place); track('pdp_view', { contentId: routeParams.contentId, element: queryEl ?? null }); })
      .catch(() => setNotFound(true));
  }, [routeParams.contentId, locale, queryEl]);

  const element: Element | undefined = isElement(queryEl) ? queryEl : place?.primaryElement;
  const color = element ? ELEMENT_COLOR[element] : '#94A3B8';

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', minHeight: '100dvh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px' }}>
        <Link href={{ pathname: '/explore', query: backQuery }} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.pdp.back}</Link>
        <LanguageSwitch />
      </div>

      {notFound && <p style={{ padding: '0 22px', color: 'var(--muted)' }}>{t.pdp.notFound}</p>}

      {place && (
        <>
          <div style={{ height: 220, position: 'relative', background: place.image ? `center/cover no-repeat url(${place.image})` : color }}>
            <button
              type="button"
              onClick={() => toggleBookmark({ contentId: place.contentId, name: place.name, region: place.region, element: element ?? place.primaryElement ?? null })}
              aria-label="Bookmark"
              aria-pressed={hasBookmark(place.contentId)}
              style={{ position: 'absolute', top: 14, right: 16, width: 40, height: 40, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 18, background: 'rgba(255,255,255,.85)', color: hasBookmark(place.contentId) ? 'var(--accent)' : 'var(--muted)' }}
            >
              {hasBookmark(place.contentId) ? '★' : '☆'}
            </button>
          </div>
          <div style={{ padding: '18px 22px 40px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)' }}>{place.region}</div>
            <h1 style={{ fontSize: 23, fontWeight: 600, margin: '4px 0 12px' }}>{place.name}</h1>

            {element && (
              <p style={{ fontSize: 14, lineHeight: 1.55, color: '#26364a', fontStyle: 'italic', margin: '0 0 20px' }}>
                {t.pdp.resonance.replace('{element}', t.elements[element])}
              </p>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{t.pdp.quiet}</h2>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginBottom: 8 }}>{t.pdp.demo}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
              {CROWD.map((h, i) => (
                <div key={DAYS[i]} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: h >= 85 ? '#C6402F' : h <= 40 ? '#1E7A6B' : '#E4EAF1', opacity: h >= 85 || h <= 40 ? 0.6 : 1 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--muted-2)', marginTop: 4 }}>
              {DAYS.map((d) => <span key={d}>{d}</span>)}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>{t.pdp.quietNote}</p>

            {/* 일정에 담기 (F-5) */}
            {(() => {
              const added = hasItem(place.contentId);
              return (
                <div style={{ marginTop: 24 }}>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => { addItem({ contentId: place.contentId, name: place.name, region: place.region, element: element ?? place.primaryElement ?? null }); track('plan_add', { contentId: place.contentId, region: place.region }); }}
                    style={{
                      width: '100%', padding: '15px 18px', borderRadius: 14, cursor: added ? 'default' : 'pointer',
                      fontSize: 15, fontWeight: 600,
                      border: `1.5px solid ${color}`, background: added ? '#fff' : color, color: added ? color : '#fff',
                    }}
                  >
                    {added ? `✓ ${t.pdp.added}` : `${t.pdp.addPlan} +`}
                  </button>
                  {added && (
                    <Link href={{ pathname: '/plan', query: backQuery }} style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                      {t.pdp.viewPlan} →
                    </Link>
                  )}
                </div>
              );
            })()}

            {/* 예약하기 — 딥링크는 나중에 연결 */}
            <button
              type="button"
              onClick={() => { /* TODO: 예약 딥링크 (여기어때/Klook 등) 연결 */ }}
              style={{ width: '100%', marginTop: 12, padding: '15px 18px', borderRadius: 14, border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}
            >
              {t.pdp.book}
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted-2)', textAlign: 'center', marginTop: 8 }}>{t.pdp.bookNote}</p>
          </div>
        </>
      )}
    </main>
  );
}
