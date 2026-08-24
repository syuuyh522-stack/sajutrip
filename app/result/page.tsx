'use client';

// F-2 사주 결과 — /api/saju 호출해 오행 분포·결핍·과잉 표시. (PRD F-2)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { BottomNav } from '../../components/BottomNav';
import { Aurora } from '../../components/Aurora';
import { elGradient } from '../../lib/ui/elements';
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
const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B',
};
const sectionH2: React.CSSProperties = { fontSize: 18, fontWeight: 600, margin: '0 0 12px' };

function ResultInner() {
  const { t } = useI18n();
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

  useEffect(() => {
    const qs = new URLSearchParams({
      gender: params.get('gender') ?? '',
      year: params.get('year') ?? '',
      month: params.get('month') ?? '',
      day: params.get('day') ?? '',
    });
    setData(null);
    setError(false);
    fetch(`/api/saju?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: SajuResponse) => { setData(json); track('result_view', { deficient: json.deficient, excess: json.excess }); })
      .catch(() => setError(true));
  }, [params]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Link href="/" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.result.back}</Link>
      </header>

      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>
        {t.result.eyebrow}
      </p>

      {error && <p style={{ color: 'var(--muted)', marginTop: 24 }}>{t.result.error}</p>}
      {!error && !data && <p style={{ color: 'var(--muted)', marginTop: 24 }}>{t.result.loading}</p>}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 20 }}>
          {/* 캐릭터 한마디 — 과잉(가장 강한) 원소 기준 (FAQ Q3 성격 규정형) */}
          <section style={{ position: 'relative', borderRadius: 'var(--r-lg)', padding: '26px 22px', color: '#fff', overflow: 'hidden', background: elGradient(data.excess), boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)' }} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9 }}>{t.elements[data.excess]}</div>
              <div style={{ fontSize: 27, fontWeight: 700, margin: '6px 0 10px', letterSpacing: '-0.4px' }}>{t.character[data.excess].label}</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, opacity: 0.95 }}>{t.character[data.excess].desc}</p>
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
                  <div key={el} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 20px', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: emphasized ? 600 : 400 }}>{t.elements[el]}</span>
                    <span style={{ height: 12, borderRadius: 999, background: 'rgba(148,163,184,.22)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.max((v / 6) * 100, 4)}%`, background: ELEMENT_COLOR[el], borderRadius: 999 }} />
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>{v}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Chip color={ELEMENT_COLOR[data.deficient]} label={t.elements[data.deficient]} tag={t.result.deficient} />
              <Chip color={ELEMENT_COLOR[data.excess]} label={t.elements[data.excess]} tag={t.result.excess} />
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
            style={{ display: 'block', textAlign: 'center', padding: '16px 18px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
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
    <div style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--muted-2)', padding: '7px 0 4px' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.15, color: '#fff', background: ELEMENT_COLOR[stemEl], padding: '8px 0' }}>
        {pillar.stem}
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.15, color: '#fff', background: ELEMENT_COLOR[branchEl], padding: '8px 0' }}>
        {pillar.branch}
      </div>
    </div>
  );
}

function StarRow({ match, title, desc, elementLabel }: { match: KStarMatch; title: string; desc: string; elementLabel: string }) {
  const color = ELEMENT_COLOR[match.element];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--glass-brd)', background: 'rgba(255,255,255,.5)', borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, flex: '0 0 auto' }} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}: {match.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: color, borderRadius: 999, padding: '4px 10px' }}>{elementLabel}</span>
    </div>
  );
}

function Chip({ color, label, tag }: { color: string; label: string; tag: string }) {
  return (
    <div style={{ flex: 1, border: `1px solid ${color}`, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color }}>{label}</div>
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
