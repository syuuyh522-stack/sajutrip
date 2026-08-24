'use client';

// F-4 PDP — 장소 상세: 공명 근거 + 혼잡/여유 시간(demo) + 예약하기(딥링크 later). (PRD F-4)
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useI18n } from '../../../i18n/LanguageProvider';
import { useItinerary } from '../../../i18n/ItineraryProvider';
import { useProfile } from '../../../i18n/ProfileProvider';
import { Aurora } from '../../../components/Aurora';
import { EL_COLOR, EL_INK, elGradient } from '../../../lib/ui/elements';
import { track } from '../../../lib/analytics/track';
import type { Element, ElementDistribution } from '../../../types/saju';
import type { Place } from '../../../types/place';
import type { Dictionary } from '../../../i18n/dictionaries';

const ELEMENT_COLOR = EL_COLOR; // 공식 팔레트 (fill 전용, §1.1)
function isElement(v: string | null): v is Element {
  return v === 'wood' || v === 'fire' || v === 'earth' || v === 'metal' || v === 'water';
}
// 혼잡/여유 demo 막대 (실시간 집중률 API 연동 전)
const CROWD = [40, 30, 55, 70, 95, 88, 60];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** 근거 모듈 — 매치 타입 배지 + 내 오행 보완 게이지(실분포 v/6 + 방문 시 +1) + 문화적 근거(§5.8) */
function MatchCard({ element, saju, t }: {
  element: Element;
  saju: { distribution: ElementDistribution; deficient: Element; excess: Element };
  t: Dictionary;
}) {
  const isFill = element === saju.deficient;
  const isEcho = element === saju.excess;
  const badge = isFill ? t.pdp.fillMatch : isEcho ? t.pdp.echoMatch : t.pdp.balanceMatch;
  const desc = (isFill ? t.pdp.fillMatchDesc : isEcho ? t.pdp.echoMatchDesc : t.pdp.balanceMatchDesc)
    .replace('{element}', t.elements[element]);
  const v = saju.distribution[element]; // 내 현재 이 원소 카운트 (0~6, 실산출값)
  const cells = Array.from({ length: 6 }, (_, i) => (i < v ? 'filled' : i === v ? 'ghost' : 'empty'));

  return (
    <section className="glass" style={{ padding: 16, margin: '0 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>{t.pdp.matchTitle}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-caption)', fontWeight: 700, color: EL_INK[element], background: `${EL_COLOR[element]}40`, borderRadius: 'var(--radius-pill)', padding: '4px 12px' }}>
          {badge}
        </span>
      </div>

      {/* 보완 게이지 — 채워진 칸 = 실분포, 점선 칸 = 이 장소가 채워줄 +1 (§7.1: 숫자엔 설명 병기) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', flex: '0 0 auto' }}>
          {t.pdp.yourLevel.replace('{element}', t.elements[element])}
        </span>
        <div style={{ display: 'flex', gap: 4, flex: 1 }} role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={6} aria-label={`${t.elements[element]} ${v}/6`}>
          {cells.map((kind, i) => (
            <span key={i} style={{
              flex: 1, height: 10, borderRadius: 4,
              background: kind === 'filled' ? EL_COLOR[element] : kind === 'ghost' ? `${EL_COLOR[element]}40` : 'rgba(185,180,199,.25)',
              border: kind === 'ghost' ? `1.5px dashed ${EL_INK[element]}` : '1.5px solid transparent',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', flex: '0 0 auto' }}>
          {v}/6 → {Math.min(v + 1, 6)}/6
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', margin: '6px 0 12px', textAlign: 'right' }}>{t.pdp.afterVisit}</p>

      <p style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--text-body-sm-lh)', margin: 0 }}>{desc}</p>
      <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
        {t.pdp.basis.replace('{element}', t.elements[element])}
      </p>
    </section>
  );
}

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

  // 내 사주(분포·결핍·과잉) — 매치·보완 게이지의 근거 데이터 (birth 파라미터 있을 때만)
  const [saju, setSaju] = useState<{ distribution: ElementDistribution; deficient: Element; excess: Element } | null>(null);
  useEffect(() => {
    if (!backQuery.year) { setSaju(null); return; }
    fetch(`/api/saju?${new URLSearchParams(backQuery).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setSaju({ distribution: j.distribution, deficient: j.deficient, excess: j.excess }))
      .catch(() => setSaju(null));
  }, [backQuery]);

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
      <Aurora />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px' }}>
        <Link href={{ pathname: '/explore', query: backQuery }} style={{ fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'none' }}>← {t.pdp.back}</Link>
      </div>

      {notFound && <p style={{ padding: '0 22px', color: 'var(--color-text-muted)' }}>{t.pdp.notFound}</p>}

      {place && (
        <>
          <div style={{ height: 220, position: 'relative', background: place.image ? `center/cover no-repeat url(${place.image})` : (element ? elGradient(element) : 'var(--color-metal)') }}>
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
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted-2)' }}>{place.region}</div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: '4px 0 12px' }}>{place.name}</h1>

            {/* 근거 모듈 — 매치 타입 + 보완 게이지 + 문화적 근거 (F-4 "추천 근거 공감") */}
            {element && saju && (
              <MatchCard element={element} saju={saju} t={t} />
            )}
            {element && !saju && (
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-text)', fontStyle: 'italic', margin: '0 0 20px' }}>
                {t.pdp.resonance.replace('{element}', t.elements[element])}
              </p>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{t.pdp.quiet}</h2>
            <div style={{ fontSize: 13, color: 'var(--muted-2)', marginBottom: 8 }}>{t.pdp.demo}</div>
            {/* 혼잡 표시 — 전용 semantic 토큰(§7.3), 원소색 재사용 금지 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
              {CROWD.map((h, i) => (
                <div key={DAYS[i]} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: h >= 85 ? 'var(--color-crowd-high)' : h <= 40 ? 'var(--color-crowd-low)' : 'rgba(185,180,199,.35)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted-2)', marginTop: 4 }}>
              {DAYS.map((d) => <span key={d}>{d}</span>)}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 6 }}>{t.pdp.quietNote}</p>

            {/* 일정에 담기 (F-5) */}
            {(() => {
              const added = hasItem(place.contentId);
              return (
                <div style={{ marginTop: 24 }}>
                  {/* primary CTA = 火 단색 pill (§1: 앱 전체 유일). disabled = 40% opacity(§4) */}
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => { addItem({ contentId: place.contentId, name: place.name, region: place.region, element: element ?? place.primaryElement ?? null }); track('plan_add', { contentId: place.contentId, region: place.region }); }}
                    style={{
                      width: '100%', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', cursor: added ? 'default' : 'pointer',
                      fontSize: 16, fontWeight: 600, border: 0,
                      background: 'var(--color-fire-strong)', color: '#fff',
                      opacity: added ? 0.4 : 1, boxShadow: added ? 'none' : 'var(--shadow-fab)',
                      transition: 'opacity var(--motion-fast)',
                    }}
                  >
                    {added ? `✓ ${t.pdp.added}` : `${t.pdp.addPlan} +`}
                  </button>
                  {added && (
                    <Link href={{ pathname: '/plan', query: backQuery }} style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--color-water)', textDecoration: 'none' }}>
                      {t.pdp.viewPlan} →
                    </Link>
                  )}
                </div>
              );
            })()}

            {/* 예약하기 — secondary(§1: primary는 fire만). 딥링크 later */}
            <button
              type="button"
              onClick={() => { /* TODO: 예약 딥링크 (여기어때/Klook 등) 연결 */ }}
              style={{ width: '100%', minHeight: 48, marginTop: 12, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: '1.5px solid rgba(185,180,199,.5)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}
            >
              {t.pdp.book}
            </button>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 8 }}>{t.pdp.bookNote}</p>
          </div>
        </>
      )}
    </main>
  );
}
