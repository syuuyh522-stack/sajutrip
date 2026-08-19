'use client';

// F-3 탐색 (SRP) — 결핍(채우기)·과잉(공명) 원소별 장소 리스트. (PRD F-3, §5.7)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { LanguageSwitch } from '../../components/LanguageSwitch';
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';

const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B',
};

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
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href={{ pathname: '/result', query: birth }} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.explore.back}</Link>
        <LanguageSwitch />
      </header>

      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 14px' }}>{t.explore.title}</h1>

      {targets && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Tab active={tab === 'fill'} color={ELEMENT_COLOR[targets.deficient]} label={t.explore.fill.replace('{element}', t.elements[targets.deficient])} onClick={() => setTab('fill')} />
          <Tab active={tab === 'echo'} color={ELEMENT_COLOR[targets.excess]} label={t.explore.echo.replace('{element}', t.elements[targets.excess])} onClick={() => setTab('echo')} />
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
            <PlaceCard place={p} color={activeElement ? ELEMENT_COLOR[activeElement] : '#94A3B8'} />
          </Link>
        ))}
      </div>
    </main>
  );
}

function Tab({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500,
        border: `1px solid ${active ? color : 'var(--line)'}`,
        background: active ? color : '#fff', color: active ? '#fff' : 'var(--muted)',
      }}
    >
      {label}
    </button>
  );
}

function PlaceCard({ place, color }: { place: Place; color: string }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 130, background: place.image ? `center/cover no-repeat url(${place.image})` : color }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-2)' }}>{place.region}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{place.name}</div>
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
