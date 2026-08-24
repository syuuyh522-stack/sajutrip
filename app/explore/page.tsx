'use client';

// F-3 탐색 (SRP) — 결핍(채우기)·과잉(공명) 원소별 장소 리스트. (PRD F-3, §5.7)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { BottomNav } from '../../components/BottomNav';
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK, elGradient } from '../../lib/ui/elements';
import { track } from '../../lib/analytics/track';
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';

const ELEMENT_COLOR = EL_COLOR; // 공식 팔레트 (fill 전용, 텍스트는 EL_INK — §1.1)

function ExploreInner() {
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

  const [targets, setTargets] = useState<{ deficient: Element; excess: Element } | null>(null);
  const [tab, setTab] = useState<'fill' | 'echo'>('fill');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) 사주 산출로 타깃 오행 결정
  useEffect(() => {
    track('explore_view');
    const qs = new URLSearchParams(birth);
    fetch(`/api/saju?${qs.toString()}`)
      .then((r) => r.json())
      .then((j) => setTargets({ deficient: j.deficient, excess: j.excess }))
      .catch(() => setTargets(null));
  }, [birth]);

  // 2) 현재 탭의 타깃 원소로 장소 조회
  const activeElement: Element | null = targets ? (tab === 'fill' ? targets.deficient : targets.excess) : null;
  useEffect(() => {
    if (!activeElement) return;
    setLoading(true);
    fetch(`/api/places?element=${activeElement}&lang=${locale}&max=30`)
      .then((r) => r.json())
      .then((j) => setPlaces(j.places ?? []))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [activeElement, locale]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 92px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href={{ pathname: '/result', query: birth }} style={{ fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'none' }}>← {t.explore.back}</Link>
      </header>

      <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: '0 0 14px' }}>{t.explore.title}</h1>

      {targets && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Tab active={tab === 'fill'} element={targets.deficient} label={t.explore.fill.replace('{element}', t.elements[targets.deficient])} onClick={() => setTab('fill')} />
          <Tab active={tab === 'echo'} element={targets.excess} label={t.explore.echo.replace('{element}', t.elements[targets.excess])} onClick={() => setTab('echo')} />
        </div>
      )}

      {loading && <p style={{ color: 'var(--muted)' }}>…</p>}
      {!loading && places.length === 0 && <p style={{ color: 'var(--muted)' }}>{t.explore.empty}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {places.map((p) => (
          <Link
            key={p.contentId}
            href={{ pathname: `/place/${p.contentId}`, query: { ...birth, ...(activeElement ? { element: activeElement } : {}) } }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <PlaceCard place={p} element={activeElement} />
          </Link>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}

// 원소 탭 — fill은 tint(§1.1: 원소색은 fill 전용), 텍스트는 ink 변형. 탭타깃 44px(§8)
function Tab({ active, element, label, onClick }: { active: boolean; element: Element; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1, minHeight: 44, padding: '10px 8px', borderRadius: 'var(--radius-input)', cursor: 'pointer', fontSize: 13,
        fontWeight: active ? 700 : 500,
        border: `1.5px solid ${active ? EL_COLOR[element] : 'rgba(185,180,199,.4)'}`,
        background: active ? `${EL_COLOR[element]}40` : 'var(--color-surface)',
        color: active ? EL_INK[element] : 'var(--color-text-muted)',
        transition: 'all var(--motion-fast)',
      }}
    >
      {label}
    </button>
  );
}

// 장소 카드 — 글래스 서피스, 이미지 폴백은 원소 그라디언트(§7.3)
function PlaceCard({ place, element }: { place: Place; element: Element | null }) {
  const fallback = element ? elGradient(element) : 'var(--color-metal)';
  return (
    <div className="glass" style={{ overflow: 'hidden' }}>
      <div style={{ height: 130, background: place.image ? `center/cover no-repeat url(${place.image})` : fallback }} />
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)' }}>{place.region}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 3 }}>{place.name}</div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreInner />
    </Suspense>
  );
}
