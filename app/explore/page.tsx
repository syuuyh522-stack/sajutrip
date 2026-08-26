'use client';

// F-3 탐색 (SRP) — 결핍(채우기)·과잉(공명) 원소별 장소 리스트. (PRD F-3, §5.7)
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { Aurora } from '../../components/Aurora';
import { EL_COLOR, EL_INK, elGradient } from '../../lib/ui/elements';
import { displayName } from '../../lib/ui/romanize';
import { loadRecent, saveRecent } from '../../lib/ui/recent-searches';
import { track } from '../../lib/analytics/track';
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';

const ELEMENT_COLOR = EL_COLOR; // 공식 팔레트 (fill 전용, 텍스트는 EL_INK — §1.1)

interface Festival { contentId: string; name: string; region: string; start: string; end: string; image?: string }
function fmtDate(yyyymmdd: string): string {
  return yyyymmdd.length === 8 ? `${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}` : '';
}

function ExploreInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '',
      year: params.get('year') ?? '',
      month: params.get('month') ?? '',
      day: params.get('day') ?? '', hour: params.get('hour') ?? '',
    }),
    [params],
  );

  const [targets, setTargets] = useState<{ deficient: Element; excess: Element } | null>(null);
  const [targetsError, setTargetsError] = useState(false);
  const [tab, setTab] = useState<'fill' | 'echo'>('fill');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) 사주 산출로 타깃 오행 결정 — 실패 시 무한 로딩 방지: 에러 상태 + 재시도 (휴리스틱 #1)
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    track('explore_view');
    const qs = new URLSearchParams(birth);
    setTargetsError(false);
    fetch(`/api/saju?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setTargets({ deficient: j.deficient, excess: j.excess }))
      .catch(() => { setTargets(null); setTargetsError(true); setLoading(false); });
  }, [birth, retryKey]);

  // 검색 (PO 결정: 별도 검색홈 대신 탐색 상단 검색바) — 입력 시 추천 리스트가 결과로 전환
  const [q, setQ] = useState('');
  const [searchResults, setSearchResults] = useState<Place[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setRecent(loadRecent()); }, []);
  useEffect(() => {
    const query = q.trim();
    if (!query) { setSearchResults(null); return; }
    setSearchLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${locale}`)
        .then((r) => r.json())
        .then((j) => {
          setSearchResults(j.places ?? []);
          if ((j.places ?? []).length > 0) setRecent(saveRecent(query));
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 350);
    return () => clearTimeout(id);
  }, [q, locale]);

  // 이번 주 축제 (검색홈에서 이사 — searchFestival2 실시간)
  const [festivals, setFestivals] = useState<Festival[]>([]);
  useEffect(() => {
    fetch(`/api/festivals?lang=${locale}`)
      .then((r) => r.json())
      .then((j) => setFestivals(j.festivals ?? []))
      .catch(() => setFestivals([]));
  }, [locale]);

  const searching = q.trim().length > 0;

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
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link href={{ pathname: '/result', query: birth }} style={{ fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'none' }}>← {t.explore.back}</Link>
      </header>

      <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: '0 0 14px' }}>{t.explore.title}</h1>

      {/* 검색바 — 추천 위 보조 도구. 입력하면 아래 리스트가 검색 결과로 전환 */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        placeholder={t.search.placeholder}
        aria-label={t.search.placeholder}
        style={{ width: '100%', minHeight: 44, padding: '12px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(185,180,199,.4)', background: 'var(--color-surface)', fontSize: 14, color: 'var(--color-text)', outline: 'none', marginBottom: 12 }}
      />
      {/* 검색바 포커스 + 미입력 → 최근 검색 칩 */}
      {searchFocused && !searching && (recent.length > 0 ? recent : t.search.recentChips).length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {(recent.length > 0 ? recent : t.search.recentChips).map((r) => (
            <button key={r} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setQ(r)}
              style={{ fontSize: 13, minHeight: 36, padding: '7px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--line)', background: 'var(--color-surface)', color: 'var(--muted)', cursor: 'pointer' }}>
              {r}
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 모드 */}
      {searching && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {searchLoading && <p style={{ color: 'var(--muted)' }}>…</p>}
          {!searchLoading && searchResults !== null && searchResults.length === 0 && <p style={{ color: 'var(--muted)' }}>{t.search.empty}</p>}
          {(searchResults ?? []).map((p) => {
            const dn = displayName(p.name, locale);
            return (
              <Link key={p.contentId} href={{ pathname: `/place/${p.contentId}`, query: { ...birth, ...(p.primaryElement ? { element: p.primaryElement } : {}) } }} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 14, padding: 10 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 12, flex: '0 0 auto', background: p.image ? `center/cover no-repeat url(${p.image})` : 'rgba(185,180,199,.35)' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dn.primary}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[dn.hangul, p.region].filter(Boolean).join(' · ')}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!searching && targets && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Tab active={tab === 'fill'} element={targets.deficient} label={t.explore.fill.replace('{element}', t.elements[targets.deficient])} onClick={() => setTab('fill')} />
          <Tab active={tab === 'echo'} element={targets.excess} label={t.explore.echo.replace('{element}', t.elements[targets.excess])} onClick={() => setTab('echo')} />
        </div>
      )}

      {!searching && targetsError && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 14px' }}>{t.result.error}</p>
          <button type="button" onClick={() => setRetryKey((k) => k + 1)} style={{ minHeight: 44, padding: '11px 20px', borderRadius: 'var(--radius-input)', border: '1px solid var(--color-accent)', background: 'rgba(108,63,224,.08)', color: 'var(--color-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {t.result.retry}
          </button>
        </div>
      )}
      {!searching && !targetsError && loading && <p style={{ color: 'var(--muted)' }}>…</p>}
      {!searching && !targetsError && !loading && places.length === 0 && <p style={{ color: 'var(--muted)' }}>{t.explore.empty}</p>}

      {!searching && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {places.map((p) => (
            <Link
              key={p.contentId}
              href={{ pathname: `/place/${p.contentId}`, query: { ...birth, ...(activeElement ? { element: activeElement } : {}) } }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <PlaceCard place={p} element={activeElement} locale={locale} />
            </Link>
          ))}
        </div>
      )}

      {/* 이번 주 축제 (검색홈에서 이사) — 추천 아래 시의성 콘텐츠 */}
      {!searching && festivals.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{t.search.festivals}</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {festivals.map((f) => (
              <div key={f.contentId} className="glass" style={{ flex: '0 0 auto', width: 168, overflow: 'hidden' }}>
                <div aria-hidden="true" style={{ height: 88, background: f.image ? `center/cover no-repeat url(${f.image})` : 'var(--color-metal)' }} />
                <div style={{ padding: '9px 11px 11px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.region}{f.start ? ` · ${fmtDate(f.start)}–${fmtDate(f.end)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* PO 피드백 #7: 첫 탭이 아닌 화면엔 GNB 미노출 */}
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
// 순한글 고유명(두루누비 등)은 en에서 로마자 主표기 + 한글 병기
function PlaceCard({ place, element, locale }: { place: Place; element: Element | null; locale: string }) {
  const fallback = element ? elGradient(element) : 'var(--color-metal)';
  const dn = displayName(place.name, locale);
  return (
    <div className="glass" style={{ overflow: 'hidden' }}>
      <div style={{ height: 130, background: place.image ? `center/cover no-repeat url(${place.image})` : fallback }} />
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)' }}>{[place.region, dn.hangul].filter(Boolean).join(' · ')}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginTop: 3 }}>{dn.primary}</div>
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
