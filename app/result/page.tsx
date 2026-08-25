'use client';

// F-2 사주 결과 — /api/saju 호출해 오행 분포·결핍·과잉 표시. (PRD F-2)
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { BottomNav } from '../../components/BottomNav';
import { Aurora } from '../../components/Aurora';
import { ElementOrb } from '../../components/ElementOrb';
import { elGradient, EL_COLOR, EL_INK, EL_ON, EL_ON_MUTED } from '../../lib/ui/elements';
import { displayName } from '../../lib/ui/romanize';
import { track } from '../../lib/analytics/track';
import type { Element, ElementDistribution, Pillar, SajuProfile } from '../../types/saju';
import type { Place } from '../../types/place';
import { STEM_ELEMENT, BRANCH_ELEMENT } from '../../config/saju-tables';

interface KStarMatch {
  name: string;
  element: Element;
}
interface SajuResponse {
  profile: SajuProfile;
  distribution: ElementDistribution;
  deficient: Element;
  excess: Element;
  kstar: { soulmate: KStarMatch | null; twin: KStarMatch | null };
}

const ELEMENT_ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
const ELEMENT_COLOR = EL_COLOR; // 파스텔 팔레트
const sectionH2: React.CSSProperties = { fontSize: 18, fontWeight: 600, margin: '0 0 12px' };

function ResultInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '',
      year: params.get('year') ?? '',
      month: params.get('month') ?? '',
      day: params.get('day') ?? '',
    }),
    [params],
  );
  const [data, setData] = useState<SajuResponse | null>(null);
  const [error, setError] = useState(false);
  // 추천 직노출 (PO 피드백 #5 — explore 진입 전 결과 하단에서 바로)
  const [recs, setRecs] = useState<Place[]>([]);
  useEffect(() => {
    if (!data) return;
    fetch(`/api/places?element=${data.deficient}&lang=${locale}&max=3`)
      .then((r) => r.json())
      .then((j) => setRecs(j.places ?? []))
      .catch(() => setRecs([]));
  }, [data, locale]);

  const load = useCallback(() => {
    setData(null);
    setError(false);
    fetch(`/api/saju?${new URLSearchParams(birth).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: SajuResponse) => { setData(json); track('result_view', { deficient: json.deficient, excess: json.excess }); })
      .catch(() => setError(true));
  }, [birth]);

  useEffect(() => { load(); }, [load]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.result.back}</Link>
      </header>

      {/* 한글엔 자간 벌림이 어색 — ko는 letterSpacing 0 */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: locale === 'ko' ? 0 : 2, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
        {t.result.eyebrow}
      </p>

      {/* H2: 에러 복구 — 재시도 버튼 */}
      {error && (
        <div className="glass" style={{ marginTop: 24, padding: 20, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', margin: '0 0 14px' }}>{t.result.error}</p>
          <button type="button" onClick={load} style={{ padding: '11px 20px', borderRadius: 12, border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.result.retry}
          </button>
        </div>
      )}
      {/* H1: 로딩 스켈레톤 */}
      {!error && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 20 }} aria-busy="true" aria-label={t.result.loading}>
          <div className="skeleton" style={{ height: 140, borderRadius: 'var(--r-lg)' }} />
          <div className="skeleton" style={{ height: 160, borderRadius: 'var(--r)' }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r)' }} />
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 20 }}>
          {/* Element Orb (§5 시그니처) — 실분포가 그라디언트 비율이 되는 리빌 모먼트 */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <ElementOrb
              distribution={data.distribution}
              size={132}
              label={ELEMENT_ORDER.map((el) => `${t.elements[el]} ${data.distribution[el]}`).join(', ')}
            />
          </div>

          {/* 캐릭터 한마디 — 과잉(가장 강한) 원소 기준 (FAQ Q3 성격 규정형) */}
          <section style={{ position: 'relative', borderRadius: 'var(--r-lg)', padding: '26px 22px', color: EL_ON[data.excess], overflow: 'hidden', background: elGradient(data.excess), boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)' }} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              {/* fill 위 텍스트 = EL_ON (v2 §1.1 — 파스텔 fill 전부 잉크 텍스트) */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: locale === 'ko' ? 0 : 2, textTransform: 'uppercase', fontWeight: 600 }}>{t.elements[data.excess]}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, margin: '6px 0 10px', letterSpacing: '-0.3px' }}>{t.character[data.excess].label}</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: EL_ON_MUTED[data.excess] }}>{t.character[data.excess].desc}</p>
            </div>
          </section>

          {/* 사주 명식 — 진짜 산출값 (연·월·일주 간지) */}
          <section className="glass" style={{ padding: 18 }}>
            <h2 style={sectionH2}>{t.saju.chartTitle}</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <PillarCard label={t.saju.year} pillar={data.profile.year} />
              <PillarCard label={t.saju.month} pillar={data.profile.month} />
              <PillarCard label={t.saju.day} pillar={data.profile.day} />
            </div>
          </section>
          {/* PO 피드백 #4: 결핍/과잉 반복 문구 제거 — 차트 인라인 태그와 캐릭터 카드로만 전달 */}

          {/* 오행 분포 + 타깃(결핍·과잉) */}
          <section className="glass" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ELEMENT_ORDER.map((el) => {
                const v = data.distribution[el];
                const emphasized = el === data.deficient || el === data.excess;
                return (
                  <div
                    key={el}
                    style={{ display: 'grid', gridTemplateColumns: '148px 1fr 20px', alignItems: 'center', gap: 12 }}
                    role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={6} aria-label={`${t.elements[el]} ${v}`}
                  >
                    {/* 색 스와치 + 라벨 + 인라인 태그(lowest/strongest — 반복 문구 대신 여기 한 곳, #4) */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: emphasized ? 700 : 400, whiteSpace: 'nowrap' }}>
                      <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 4, background: EL_COLOR[el], flex: '0 0 auto' }} />
                      {t.elements[el]}
                      {el === data.deficient && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: EL_INK[el], background: `${EL_COLOR[el]}40`, borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>{t.result.lowestTag}</span>
                      )}
                      {el === data.excess && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: EL_INK[el], background: `${EL_COLOR[el]}40`, borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>{t.result.strongestTag}</span>
                      )}
                    </span>
                    <span style={{ height: 12, borderRadius: 999, background: 'rgba(148,163,184,.22)', overflow: 'hidden' }}>
                      {/* D2: 0이면 막대 없음 */}
                      {v > 0 && <span style={{ display: 'block', height: '100%', width: `${(v / 6) * 100}%`, background: ELEMENT_COLOR[el], borderRadius: 999 }} />}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: v === 0 ? 'var(--muted-2)' : 'var(--muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  </div>
                );
              })}
            </div>
          </section>
          {/* PO 피드백 #4: 결핍/과잉 칩 제거 — 차트 인라인 태그로 통합 */}

          {/* K-star (F-2) */}
          {(data.kstar.soulmate || data.kstar.twin) && (
            <section className="glass" style={{ padding: 18 }}>
              <h2 style={sectionH2}>
                {t.kstar.title} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted-2)' }}>· {t.kstar.forFun}</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.kstar.soulmate && (
                  <StarRow match={data.kstar.soulmate} title={t.kstar.soulmate} desc={t.kstar.soulmateDesc} elementLabel={t.elements[data.kstar.soulmate.element]} />
                )}
                {data.kstar.twin && (
                  <StarRow match={data.kstar.twin} title={t.kstar.twin} desc={t.kstar.twinDesc} elementLabel={t.elements[data.kstar.twin.element]} />
                )}
              </div>
            </section>
          )}

          {/* 추천 직노출 (PO 피드백 #5) — explore 이동 없이 결과 하단에서 바로 탐색 시작 */}
          {recs.length > 0 && (
            <section>
              <h2 style={sectionH2}>{t.result.recsTitle}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recs.map((p) => (
                  <Link key={p.contentId} href={{ pathname: `/place/${p.contentId}`, query: { ...birth, element: data.deficient } }} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-input)', flex: '0 0 auto', background: p.image ? `center/cover no-repeat url(${p.image})` : elGradient(data.deficient) }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(p.name, locale).primary}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[displayName(p.name, locale).hangul, p.region].filter(Boolean).join(' \u00b7 ')}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={{ pathname: '/explore', query: birth }}
                style={{ display: 'block', textAlign: 'center', marginTop: 14, minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--color-text)', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}
              >
                {t.result.seeAll} →
              </Link>
            </section>
          )}
        </div>
      )}
      <BottomNav />
    </main>
  );
}

function PillarCard({ label, pillar }: { label: string; pillar: Pillar }) {
  const stemEl = STEM_ELEMENT[pillar.stem];
  const branchEl = BRANCH_ELEMENT[pillar.branch];
  return (
    <div style={{ flex: 1, border: '1px solid var(--glass-brd)', borderRadius: 14, overflow: 'hidden', textAlign: 'center', background: 'rgba(255,255,255,.4)' }}>
      <div style={{ fontSize: 13, color: 'var(--muted-2)', padding: '7px 0 4px' }}>{label}</div>
      {/* fill 위 간지 = EL_ON (v2: 파스텔 fill 위 잉크 텍스트, §1.1) */}
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, color: EL_ON[stemEl], background: ELEMENT_COLOR[stemEl], padding: '8px 0' }}>
        {pillar.stem}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, color: EL_ON[branchEl], background: ELEMENT_COLOR[branchEl], padding: '8px 0' }}>
        {pillar.branch}
      </div>
    </div>
  );
}

function StarRow({ match, title, desc, elementLabel }: { match: KStarMatch; title: string; desc: string; elementLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--glass-brd)', background: 'rgba(255,255,255,.5)', borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: elGradient(match.element), flex: '0 0 auto' }} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}: {match.name}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{desc}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: EL_ON[match.element], background: EL_COLOR[match.element], borderRadius: 999, padding: '4px 10px' }}>{elementLabel}</span>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultInner />
    </Suspense>
  );
}
