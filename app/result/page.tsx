'use client';

// F-2 사주 결과 — /api/saju 호출해 오행 분포·결핍·과잉 표시. (PRD F-2)
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { BottomNav } from '../../components/BottomNav';
import { Aurora } from '../../components/Aurora';
import { elGradient, EL_COLOR, EL_INK, EL_ON, EL_ON_MUTED } from '../../lib/ui/elements';
import { track } from '../../lib/analytics/track';
import type { Element, ElementDistribution, Pillar, SajuProfile } from '../../types/saju';
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
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: locale === 'ko' ? 0 : 2, textTransform: 'uppercase', color: 'var(--color-water)', margin: 0 }}>
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
          {/* 캐릭터 한마디 — 과잉(가장 강한) 원소 기준 (FAQ Q3 성격 규정형) */}
          <section style={{ position: 'relative', borderRadius: 'var(--r-lg)', padding: '26px 22px', color: EL_ON[data.excess], overflow: 'hidden', background: elGradient(data.excess), boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)' }} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              {/* fill 위 텍스트 = EL_ON (§1.1 — 水는 어두운 fill이라 흰색, 나머지는 잉크) */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: locale === 'ko' ? 0 : 2, textTransform: 'uppercase', fontWeight: 600 }}>{t.elements[data.excess]}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 600, margin: '6px 0 10px', letterSpacing: '-0.3px' }}>{t.character[data.excess].label}</div>
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
            {/* 공명 카피 — 결핍 원소 기준 (§5.8) */}
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#26364a', fontStyle: 'italic', margin: '16px 0 0' }}>
              {t.saju.resonance.replace('{element}', t.elements[data.deficient])}
            </p>
          </section>

          {/* 오행 분포 + 타깃(결핍·과잉) */}
          <section className="glass" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ELEMENT_ORDER.map((el) => {
                const v = data.distribution[el];
                const emphasized = el === data.deficient || el === data.excess;
                return (
                  <div
                    key={el}
                    style={{ display: 'grid', gridTemplateColumns: '92px 1fr 20px', alignItems: 'center', gap: 12 }}
                    role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={6} aria-label={`${t.elements[el]} ${v}`}
                  >
                    {/* 색 스와치 + 라벨 (§6: 한자 UI 금지 — 색+텍스트 라벨로 구분) */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: emphasized ? 700 : 400 }}>
                      <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 4, background: EL_COLOR[el], flex: '0 0 auto' }} />
                      {t.elements[el]}
                    </span>
                    <span style={{ height: 12, borderRadius: 999, background: 'rgba(148,163,184,.22)', overflow: 'hidden' }}>
                      {/* D2: 0이면 막대 없음 */}
                      {v > 0 && <span style={{ display: 'block', height: '100%', width: `${(v / 6) * 100}%`, background: ELEMENT_COLOR[el], borderRadius: 999 }} />}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: v === 0 ? 'var(--muted-2)' : 'var(--muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Chip element={data.deficient} label={t.elements[data.deficient]} tag={t.result.deficient} />
              <Chip element={data.excess} label={t.elements[data.excess]} tag={t.result.excess} />
            </div>
          </section>

          {/* K-star (F-2) */}
          {(data.kstar.soulmate || data.kstar.twin) && (
            <section className="glass" style={{ padding: 18 }}>
              <h2 style={sectionH2}>
                {t.kstar.title} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted-2)' }}>· {t.kstar.forFun}</span>
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

          <Link
            href={{ pathname: '/explore', query: birth }}
            style={{ display: 'block', textAlign: 'center', padding: '16px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--color-fire-strong)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}
          >
            {t.explore.cta} →
          </Link>
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
      <div style={{ fontSize: 11, color: 'var(--muted-2)', padding: '7px 0 4px' }}>{label}</div>
      {/* fill 위 간지 = EL_ON (水 fill은 어두워 흰 글자, §1.1) */}
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15, color: EL_ON[stemEl], background: ELEMENT_COLOR[stemEl], padding: '8px 0' }}>
        {pillar.stem}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15, color: EL_ON[branchEl], background: ELEMENT_COLOR[branchEl], padding: '8px 0' }}>
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
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: EL_ON[match.element], background: EL_COLOR[match.element], borderRadius: 999, padding: '4px 10px' }}>{elementLabel}</span>
    </div>
  );
}

function Chip({ element, label, tag }: { element: Element; label: string; tag: string }) {
  return (
    <div style={{ flex: 1, border: '1px solid var(--glass-brd)', background: `${EL_COLOR[element]}40`, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: EL_INK[element] }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tag}</div>
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
