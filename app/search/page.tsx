'use client';

// (레거시) 검색 화면 — PO 결정으로 검색은 탐색(explore) 상단 검색바로 통합. 딥링크 호환용으로만 유지, GNB 미노출.
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { Aurora } from '../../components/Aurora';
import { displayName } from '../../lib/ui/romanize';
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

interface Festival { contentId: string; name: string; region: string; start: string; end: string; image?: string }

const RECENT_KEY = 'sajutrip.recentSearches';
function loadRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
  } catch { return []; }
}
function fmtDate(yyyymmdd: string): string {
  return yyyymmdd.length === 8 ? `${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}` : '';
}

function SearchInner() {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const birth = useMemo(
    () => ({ gender: params.get('gender') ?? '', year: params.get('year') ?? '', month: params.get('month') ?? '', day: params.get('day') ?? '', hour: params.get('hour') ?? '' }),
    [params],
  );
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  // 오행 태그 검색 (PRD 검색 필드 3종 중 하나) — 텍스트 검색과 상호 배타
  const [elFilter, setElFilter] = useState<Element | null>(null);

  // 검색홈 (PRD P1): 최근 검색 = localStorage 실기록, 축제 = searchFestival2 실시간
  const [recent, setRecent] = useState<string[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  useEffect(() => { setRecent(loadRecent()); }, []);
  useEffect(() => {
    fetch(`/api/festivals?lang=${locale}`)
      .then((r) => r.json())
      .then((j) => setFestivals(j.festivals ?? []))
      .catch(() => setFestivals([]));
  }, [locale]);

  // 오행 태그 선택 → 해당 원소 장소 리스트 (기존 추천 API 재사용, 신규 스펙 없음)
  useEffect(() => {
    if (!elFilter) return;
    setLoading(true);
    fetch(`/api/places?element=${elFilter}&lang=${locale}&max=20`)
      .then((r) => r.json())
      .then((j) => setResults(j.places ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [elFilter, locale]);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      if (!elFilter) setResults(null);
      return;
    }
    setElFilter(null); // 텍스트 입력 시 태그 필터 해제
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${locale}`)
        .then((r) => r.json())
        .then((j) => {
          setResults(j.places ?? []);
          // 결과가 있는 검색어만 최근 검색에 기록 (최대 6, 중복 제거)
          if ((j.places ?? []).length > 0) {
            const next = [query, ...loadRecent().filter((s) => s !== query)].slice(0, 6);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            setRecent(next);
          }
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(id);
  }, [q, locale, elFilter]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: 0 }}>{t.search.title}</h1>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.search.placeholder}
        aria-label={t.search.title}
        style={{ width: '100%', minHeight: 44, padding: '13px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(185,180,199,.4)', background: 'var(--color-surface)', fontSize: 14, color: 'var(--color-text)', outline: 'none' }}
      />

      {/* 오행 태그 검색 — 뉴트럴 칩, 활성=accent(§1: 선택 상태). 원소색 다색 노출 금지(절제 규칙) */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{t.search.byElement}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label={t.search.byElement}>
          {ELEMENTS.map((el) => {
            const active = elFilter === el;
            return (
              <button
                key={el}
                type="button"
                aria-pressed={active}
                onClick={() => { setQ(''); setElFilter(active ? null : el); if (active) setResults(null); }}
                style={{
                  ...chip,
                  ...(active ? { border: '1.5px solid var(--color-accent)', background: 'rgba(108,63,224,.10)', color: 'var(--color-accent)', fontWeight: 600 } : {}),
                }}
              >
                {t.elements[el]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 검색어 없을 때 = 검색홈 (PRD: 최근 검색결과 + 이번 주 진행중인 축제) */}
      {results === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
          <section>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t.search.recent}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(recent.length > 0 ? recent : t.search.recentChips).map((r) => (
                <button key={r} type="button" onClick={() => setQ(r)} style={chip}>{r}</button>
              ))}
            </div>
          </section>
          <section>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{t.search.festivals}</div>
            {festivals.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted-2)', margin: 0 }}>{t.search.festivalsNote}</p>}
            {/* 축제명은 고유명사(데이터) — 로케일 무관 노출, en은 EngService2 원문 */}
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
        </div>
      )}

      {/* 검색 결과 */}
      {results !== null && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && <p style={{ color: 'var(--muted)' }}>…</p>}
          {!loading && results.length === 0 && <p style={{ color: 'var(--muted)' }}>{t.search.empty}</p>}
          {results.map((p) => {
            const dn = displayName(p.name, locale);
            return (
              <Link key={p.contentId} href={{ pathname: `/place/${p.contentId}`, query: { ...birth, ...(p.primaryElement ? { element: p.primaryElement } : {}) } }} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 14, padding: 10 }}>
                  {/* 썸네일 폴백 뉴트럴 — 검색 결과에 원소색 다색 노출 금지 (v2 §1 절제 규칙) */}
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
    </main>
  );
}

const chip: React.CSSProperties = {
  fontSize: 13, minHeight: 44, padding: '8px 16px', borderRadius: 999, border: '1px solid var(--line)', background: '#fff', color: 'var(--muted)', cursor: 'pointer',
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
