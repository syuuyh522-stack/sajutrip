'use client';

// F-5 일정 — 결핍 원소 pre-fill(고정) + 여행일자 + 일자별 담기. (PRD F-5)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { useItinerary } from '../../i18n/ItineraryProvider';
import { useProfile } from '../../i18n/ProfileProvider';
import { BottomNav } from '../../components/BottomNav';
import { AppHeader } from '../../components/AppHeader';
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK } from '../../lib/ui/elements';
import { relatedAreaFor } from '../../config/related-region';
import { track } from '../../lib/analytics/track';
import { displayName } from '../../lib/ui/romanize';
import { useResolvedPlaceNames } from '../../lib/ui/useResolvedPlaceNames';
import type { Element } from '../../types/saju';

const ELEMENT_COLOR = EL_COLOR; // 공식 팔레트 (fill 전용, §1.1)

interface RelatedSpot { name: string; region: string; category: string; rank: number }

function PlanInner() {
  const { t, locale } = useI18n();
  const { state, dayCount, setDates, setItemDay, removeItem } = useItinerary();
  const { toggleCollect, isCollected } = useProfile();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '', year: params.get('year') ?? '',
      month: params.get('month') ?? '', day: params.get('day') ?? '', hour: params.get('hour') ?? '',
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

  // 담은 장소 중 조회 가능한 첫 지역 기준으로 연관 관광지(F-5 동선 확장)
  const [related, setRelated] = useState<RelatedSpot[]>([]);
  const firstArea = useMemo(() => {
    for (const it of state.items) {
      const a = relatedAreaFor(it.region);
      if (a) return a;
    }
    return null;
  }, [state.items]);
  useEffect(() => {
    // 장소명은 고유명사(데이터) — 로케일 무관 노출. UI 라벨만 i18n.
    if (!firstArea) { setRelated([]); return; }
    fetch(`/api/related?areaCd=${firstArea.areaCd}&signguCd=${firstArea.signguCd}`)
      .then((r) => r.json())
      .then((j) => setRelated(j.spots ?? []))
      .catch(() => setRelated([]));
  }, [firstArea]);

  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  // PO 피드백 #10: 공유 카드는 여행 종료일이 지난 뒤에만 (종료일 당일 저녁 포함)
  const tripEnded = Boolean(state.end) && new Date(`${state.end}T00:00:00`).getTime() <= Date.now();

  // 저장된 이름은 담는 시점 로케일 스냅샷 — 현재 로케일 이름으로 재조회(못 찾으면 스냅샷 유지)
  const resolved = useResolvedPlaceNames(state.items, locale);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <AppHeader />

      <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: '0 0 16px' }}>{t.plan.title}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 결핍 원소 pre-fill (고정) — 원소색 스와치(fill) + ink 텍스트(§1.1), 한자 아이콘 금지(§6) */}
        {deficient && (
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
            <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 8, background: ELEMENT_COLOR[deficient], flex: '0 0 auto' }} />
            <span style={{ flex: 1, fontSize: 13 }}>{t.plan.target}: <b style={{ color: EL_INK[deficient] }}>{t.elements[deficient]}</b></span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>🔒 {t.plan.locked}</span>
          </div>
        )}

        {/* 여행 일자 (필수) */}
        <div>
          <label style={{ display: 'block', fontSize: 13, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{t.plan.dates}</label>
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
                  {/* Day 마커 — v2 §7.4: 레일 마커는 mono, 잉크 fill(원소색·accent 금지) */}
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--color-text)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{d}</span>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{t.plan.day.replace('{n}', String(d))}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {dayItems.map((it) => {
                    const collected = isCollected(it.contentId);
                    // 이름: 로케일 재조회 우선 → 순한글 고유명은 en에서 로마자 主표기 + 한글 병기
                    const raw = resolved[it.contentId] ?? { name: it.name, region: it.region };
                    const dn = displayName(raw.name, locale);
                    // PO 피드백 #9: 체크인을 Day 스탑에 통합 — 체크 = 엘리먼트 수집
                    return (
                      <div key={it.contentId} className="glass" style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* 장소명 영역만 상세로 연결한다. 행 전체를 링크로 만들면 체크인·일차
                              변경·삭제 컨트롤과 충돌한다. @modal 인터셉트 라우트가 받아서
                              이 화면을 유지한 채 바텀시트로 열린다(444569b). */}
                          <Link
                            href={{ pathname: `/place/${it.contentId}`, query: { ...birth, ...(it.element ? { element: it.element } : {}) } }}
                            style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: collected ? 'line-through' : 'none', opacity: collected ? 0.7 : 1 }}>{dn.primary}</div>
                            <div style={{ fontSize: 13, color: collected && it.element ? EL_INK[it.element] : 'var(--muted)', fontWeight: collected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {collected && it.element ? `+1 ${t.elements[it.element]}` : [dn.hangul, raw.region].filter(Boolean).join(' · ')}
                            </div>
                          </Link>
                          <button type="button" onClick={() => removeItem(it.contentId)} aria-label={t.plan.remove} style={{ border: 0, background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 44, height: 44, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>×</button>
                        </div>
                        {/* 체크인 = 엘리먼트 수집(§컨셉). 맨 체크박스로는 무엇을 하는 동작인지
                            알 수 없어서 라벨 있는 토글 버튼으로 바꿨다. 누른 뒤엔 '다녀옴'으로
                            상태를 그대로 말한다(aria-pressed로도 전달). */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                          <button
                            type="button"
                            onClick={() => { toggleCollect(it.contentId, it.element); if (!collected) track('checkin', { contentId: it.contentId, element: it.element }); }}
                            aria-pressed={collected}
                            style={{
                              minHeight: 36, padding: '8px 14px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                              fontSize: 13, fontWeight: 600, flex: '0 0 auto',
                              border: collected ? 0 : '1.5px solid rgba(185,180,199,.55)',
                              background: collected ? 'var(--accent-soft)' : 'var(--color-surface)',
                              color: collected ? 'var(--color-accent)' : 'var(--color-text)',
                            }}
                          >
                            {collected ? `✓ ${t.checkin.visited}` : t.checkin.action}
                          </button>
                          <span style={{ flex: 1 }} />
                          <select value={it.day} onChange={(e) => setItemDay(it.contentId, Number(e.target.value))} aria-label={t.plan.dayPicker} style={daySelect}>
                            {days.map((n) => <option key={n} value={n}>{t.plan.day.replace('{n}', String(n))}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  {dayItems.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: 0 }}>—</p>}
                </div>
              </section>
            );
          })}

        {/* 연관 관광지 (F-5 동선 확장, TarRlteTar 실데이터) */}
        {related.length > 0 && (
          <section>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.plan.related}</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {/* 연관관광지 API는 한국어 전용 → en에서는 로마자 主표기 + 한글 병기 */}
              {related.map((s) => {
                const dn = displayName(s.name, locale);
                const region = displayName(s.region, locale).primary;
                return (
                  <div key={s.name} style={{ flex: '0 0 auto', minWidth: 130, maxWidth: 180, border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dn.primary}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {[dn.hangul, region, s.category || null].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {state.items.length > 0 && <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>{t.plan.nearby}</p>}

        {/* PO 피드백 #9: 별도 체크인 섹션 제거 — Day 스탑에 통합됨 */}
        {/* PO 피드백 #10: 공유 카드 CTA는 상시 노출 금지 — 여행 종료일 이후에만 */}
        {state.items.length > 0 && tripEnded && (
          <Link
            href={{ pathname: '/share', query: birth }}
            onClick={() => {
              // NorthStar(§8.1): 지방(비수도권) 스팟 1개 이상 포함 완성 일정
              const CAPITAL = ['서울', '경기', '인천', 'Seoul', 'Gyeonggi', 'Incheon'];
              const regionalIncluded = state.items.some((it) => !CAPITAL.some((c) => it.region.includes(c)));
              track('plan_complete', { items: state.items.length, regionalIncluded, days: dayCount });
            }}
            style={{ display: 'block', textAlign: 'center', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--color-text)', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}
          >
            {t.plan.finish} →
          </Link>
        )}
      </div>
      <BottomNav />
    </main>
  );
}

const dateInput: React.CSSProperties = {
  flex: 1, minWidth: 0, padding: 12, borderRadius: 11, border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', background: '#fff',
};
const daySelect: React.CSSProperties = {
  border: '1px solid rgba(185,180,199,.4)', borderRadius: 8, padding: '6px 8px', fontSize: 13, minHeight: 44, color: 'var(--ink)', background: '#fff', flex: '0 0 auto',
};

export default function PlanPage() {
  return (
    <Suspense fallback={null}>
      <PlanInner />
    </Suspense>
  );
}
