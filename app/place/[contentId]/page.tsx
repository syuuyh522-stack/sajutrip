'use client';

// F-4 PDP — 장소 상세: 공명 근거 + 혼잡/여유 시간(demo) + 예약하기(딥링크 later). (PRD F-4)
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '../../../i18n/LanguageProvider';
import { useItinerary } from '../../../i18n/ItineraryProvider';
import { useProfile } from '../../../i18n/ProfileProvider';
import { Aurora } from '../../../components/Aurora';
import { EL_COLOR, EL_INK, elGradient } from '../../../lib/ui/elements';
import { displayName } from '../../../lib/ui/romanize';
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

/**
 * 근거 모듈 (리프레이밍 A+B — 사주는 불변, 게이지의 주어는 "이번 여행"):
 * ① 차트 진단 한 줄 = 실분포 v/6 + 불변 명시 ② 수집 게이지 = 이번 여행 체크인 수 + 이 스탑의 +1(점선)
 * ③ 근거 카피 = 결핍 매치는 "곁에 두기"(basisFill), 그 외 공명 톤(§5.8)
 */
function MatchCard({ element, saju, t }: {
  element: Element;
  saju: { distribution: ElementDistribution; deficient: Element; excess: Element };
  t: Dictionary;
}) {
  const { collectedCount } = useProfile();
  const isFill = element === saju.deficient;
  const isEcho = element === saju.excess;
  const badge = isFill ? t.pdp.fillMatch : isEcho ? t.pdp.echoMatch : t.pdp.balanceMatch;
  const desc = (isFill ? t.pdp.fillMatchDesc : isEcho ? t.pdp.echoMatchDesc : t.pdp.balanceMatchDesc)
    .replace('{element}', t.elements[element]);
  const basis = (isFill ? t.pdp.basisFill : t.pdp.basis).replace('{element}', t.elements[element]);

  const v = saju.distribution[element]; // 명식의 이 원소 카운트 (불변 진단)
  const total = (Object.values(saju.distribution) as number[]).reduce((a, b) => a + b, 0); // 6(시간 미상) 또는 8(시주 포함)
  const chartTag = isFill ? t.result.lowestTag : isEcho ? t.result.strongestTag : null;

  const got = Math.min(collectedCount(element), 6); // 이번 여행에서 체크인으로 모은 수
  const cells = Array.from({ length: 6 }, (_, i) => (i < got ? 'filled' : i === got ? 'ghost' : 'empty'));

  return (
    <section className="glass" style={{ padding: 16, margin: '0 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>{t.pdp.matchTitle}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-caption)', fontWeight: 700, color: EL_INK[element], background: `${EL_COLOR[element]}40`, borderRadius: 'var(--radius-pill)', padding: '4px 12px' }}>
          {badge}
        </span>
      </div>

      {/* ① 차트 진단 + 보강 동기 — "부족하다"에서 끝내지 않고 "여기서 보강한다"로 (PO 피드백) */}
      <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: '0 0 10px', paddingBottom: 10, borderBottom: '1px solid rgba(185,180,199,.3)' }}>
        {t.pdp.chartPrefix}: <b style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{t.elements[element]} {v}/{total}</b>
        {chartTag ? <> · <b style={{ color: EL_INK[element] }}>{chartTag}</b></> : null}
        {(isFill || isEcho) && <> — <b style={{ color: 'var(--color-text)' }}>{isFill ? t.pdp.chartBoostFill : t.pdp.chartBoostEcho}</b></>}
      </p>

      {/* ② 수집 게이지 — 채워진 칸 = 이번 여행 체크인, 점선 칸 = 이 스탑의 +1 (§7.1: 숫자엔 설명 병기) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', flex: '0 0 auto' }}>
          {t.pdp.tripLevel.replace('{element}', t.elements[element])}
        </span>
        <div style={{ display: 'flex', gap: 4, flex: 1 }} role="meter" aria-valuenow={got} aria-valuemin={0} aria-valuemax={6} aria-label={`${t.pdp.tripLevel.replace('{element}', t.elements[element])} ${got}`}>
          {cells.map((kind, i) => (
            <span key={i} style={{
              flex: 1, height: 10, borderRadius: 4,
              background: kind === 'filled' ? EL_COLOR[element] : kind === 'ghost' ? `${EL_COLOR[element]}40` : 'rgba(185,180,199,.25)',
              border: kind === 'ghost' ? `1.5px dashed ${EL_INK[element]}` : '1.5px solid transparent',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', flex: '0 0 auto' }}>
          +1
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', margin: '6px 0 12px', textAlign: 'right' }}>{t.pdp.afterVisit}</p>

      <p style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--text-body-sm-lh)', margin: 0 }}>{desc}</p>
      <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
        {basis}
      </p>
    </section>
  );
}

/**
 * 원소 가이드 (OTA식 상세 모듈, PO 피드백):
 * ① 여기서 하는 것 3가지(행위→기운 연결) ② 이 기운이 내 사주에서 키워주는 것(칩).
 * 원소별 콘텐츠는 i18n elementGuide — §5.8 문화적 해석 톤, 효과 단정 없음.
 */
function ElementGuide({ element, t }: { element: Element; t: Dictionary }) {
  const guide = t.elementGuide[element];
  const elName = t.elements[element];
  return (
    <>
      {/* 여기서 하는 것 — 번호 대신 원소색 도트(이 화면의 단일 hue, 작게) */}
      <section className="glass" style={{ padding: 16, margin: '0 0 14px' }}>
        <h2 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, margin: '0 0 12px' }}>
          {t.pdp.howTitle.replace('{element}', elName)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {guide.actions.map((a) => (
            <div key={a.title} style={{ display: 'flex', gap: 10 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: EL_COLOR[element], flex: '0 0 auto', marginTop: 6 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>{a.title}</div>
                <div style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', marginTop: 2 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 이 기운이 키워주는 것 — 뉴트럴 칩 (§1: status/보조 정보는 뉴트럴) */}
      <section className="glass" style={{ padding: 16, margin: '0 0 20px' }}>
        <h2 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, margin: '0 0 10px' }}>
          {t.pdp.strengthTitle.replace('{element}', elName)}
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {guide.strengthens.map((v) => (
            <span key={v} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-status-text)', background: 'var(--color-status-bg)', borderRadius: 'var(--radius-pill)', padding: '6px 12px' }}>
              {v}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

export default function PlacePage() {
  const { t, locale } = useI18n();
  const { state: itin, setDates, addItem, hasItem } = useItinerary();
  const { toggleBookmark, hasBookmark } = useProfile();

  // PO 피드백 #8: 담기 시 페이지 유지 + 토스트 / #11: 첫 담기 시 여행 일자부터 받기
  const [toast, setToast] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(id);
  }, [toast]);
  const routeParams = useParams<{ contentId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  // 닫기 = 진입 출처로 (검색·찜·추천 등 다양) — 히스토리 없으면 explore 폴백 (휴리스틱 #6)
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(`/explore?${new URLSearchParams(backQuery).toString()}`);
  };

  const backQuery = useMemo(() => {
    const q: Record<string, string> = {};
    for (const k of ['gender', 'year', 'month', 'day', 'hour']) {
      const v = search.get(k);
      if (v) q[k] = v;
    }
    return q;
  }, [search]);

  const [place, setPlace] = useState<Place | null>(null);
  // 장소별 실데이터 (detailCommon2/detailIntro2) — 같은 원소여도 장소마다 다른 콘텐츠
  // 여행자 영상 (YouTube) — 장소·지역 키워드 검색, 키 미설정 시 빈 배열 → 검색 링크 폴백
  const [videos, setVideos] = useState<{ videoId: string; title: string; thumbnail: string; channel: string }[]>([]);
  const [about, setAbout] = useState<{ overview?: string; expGuide?: string; useTime?: string; restDate?: string; highlights?: string[] } | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
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
      .then((j) => { setPlace(j.place); setAbout(j.about ?? null); track('pdp_view', { contentId: routeParams.contentId, element: queryEl ?? null }); })
      .catch(() => setNotFound(true));
  }, [routeParams.contentId, locale, queryEl]);

  const element: Element | undefined = isElement(queryEl) ? queryEl : place?.primaryElement;

  // 영상 검색어: 괄호 병기 앞부분 + 지역 (예: "Busan Healing Forest Busan")
  const videoQuery = place ? `${place.name.split('(')[0].trim()} ${place.region}`.trim() : '';
  useEffect(() => {
    if (!videoQuery) { setVideos([]); return; }
    fetch(`/api/videos?q=${encodeURIComponent(videoQuery)}`)
      .then((r) => r.json())
      .then((j) => setVideos(j.videos ?? []))
      .catch(() => setVideos([]));
  }, [videoQuery]);

  return (
    // PO 피드백 #6: PDP = 바텀시트 프레젠테이션 — 상단 딤 영역 탭/닫기 버튼으로 쉽게 복귀 (route는 유지: 딥링크·Phase 2 호환)
    <main style={{ maxWidth: 460, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Aurora />
      <div
        aria-hidden="true"
        onClick={goBack}
        style={{ height: 44, flex: '0 0 auto', cursor: 'pointer' }}
      />

      {notFound && <p style={{ padding: '0 22px', color: 'var(--color-text-muted)' }}>{t.pdp.notFound}</p>}

      {/* 로딩 스켈레톤 — 빈 시트 방지 (휴리스틱 #4, §4 loading) */}
      {!place && !notFound && (
        <div className="pdp-sheet" aria-busy="true" style={{ flex: 1, borderRadius: '20px 20px 0 0', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: '0 -12px 40px rgba(43,42,51,.18)' }}>
          <div className="skeleton" style={{ height: 220 }} />
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="skeleton" style={{ height: 20, width: '55%', borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-card-sm)' }} />
            <div className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-pill)' }} />
          </div>
        </div>
      )}

      {place && (
        <div className="pdp-sheet" style={{ flex: 1, borderRadius: '20px 20px 0 0', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: '0 -12px 40px rgba(43,42,51,.18)' }}>
          <div style={{ height: 220, position: 'relative', background: place.image ? `center/cover no-repeat url(${place.image})` : (element ? elGradient(element) : 'var(--color-metal)') }}>
            {/* 닫기 — 시트 좌상단 (§8 탭타깃). 진입 출처로 복귀(back), 직접 진입 시 explore 폴백 */}
            <button
              type="button"
              onClick={goBack}
              aria-label={t.pdp.back}
              style={{ position: 'absolute', top: 14, left: 16, width: 40, height: 40, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 20, lineHeight: 1, background: 'rgba(255,255,255,.85)', color: 'var(--color-text)' }}
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => toggleBookmark({ contentId: place.contentId, name: place.name, region: place.region, element: element ?? place.primaryElement ?? null })}
              aria-label={t.pdp.bookmark}
              aria-pressed={hasBookmark(place.contentId)}
              style={{ position: 'absolute', top: 14, right: 16, width: 40, height: 40, borderRadius: '50%', border: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 18, background: 'rgba(255,255,255,.85)', color: hasBookmark(place.contentId) ? 'var(--accent)' : 'var(--muted)' }}
            >
              {hasBookmark(place.contentId) ? '★' : '☆'}
            </button>
          </div>
          <div style={{ padding: '18px 22px 40px' }}>
            {(() => {
              const dn = displayName(place.name, locale);
              return (
                <>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted-2)' }}>{[place.region, dn.hangul].filter(Boolean).join(' \u00b7 ')}</div>
                  <h1 style={{ fontSize: 24, fontWeight: 600, margin: '4px 0 12px' }}>{dn.primary}</h1>
                </>
              );
            })()}

            {/* 근거 모듈 — 매치 타입 + 보완 게이지 + 문화적 근거 (F-4 "추천 근거 공감") */}
            {element && saju && (
              <MatchCard element={element} saju={saju} t={t} />
            )}
            {element && !saju && (
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-text)', fontStyle: 'italic', margin: '0 0 20px' }}>
                {t.pdp.resonance.replace('{element}', t.elements[element])}
              </p>
            )}

            {/* 장소별 소개 (detailCommon2 overview) — 같은 원소여도 장소 고유 콘텐츠 */}
            {about?.overview && (
              <section className="glass" style={{ padding: 16, margin: '0 0 14px' }}>
                <h2 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, margin: '0 0 8px' }}>{t.pdp.aboutTitle}</h2>
                {/* 특징 요약 칩 — 소개문에서 규칙 추출, 줄글보다 먼저 (뉴트럴, §1) */}
                {about.highlights && about.highlights.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {about.highlights.map((h) => (
                      <span key={h} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-status-text)', background: 'var(--color-status-bg)', borderRadius: 'var(--radius-pill)', padding: '5px 11px' }}>
                        {h}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{
                  fontSize: 14, lineHeight: 'var(--text-body-sm-lh)', color: 'var(--color-text)', margin: 0, whiteSpace: 'pre-line',
                  ...(aboutOpen ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }),
                }}>
                  {about.overview}
                </p>
                {about.overview.length > 160 && (
                  <button type="button" onClick={() => setAboutOpen((v) => !v)} aria-expanded={aboutOpen}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '10px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>
                    {aboutOpen ? t.pdp.less : t.pdp.more}
                  </button>
                )}
                {about.expGuide && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(185,180,199,.3)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.pdp.programLabel}</div>
                    <p style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'pre-line' }}>{about.expGuide}</p>
                  </div>
                )}
              </section>
            )}

            {/* 이용시간·휴무 (detailIntro2) — mono 데이터 행 */}
            {(about?.useTime || about?.restDate) && (
              <section className="glass" style={{ padding: '6px 16px', margin: '0 0 14px' }}>
                <h2 style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, margin: '10px 0' }}>{t.pdp.goodToKnow}</h2>
                {about.useTime && (
                  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderTop: '1px solid rgba(185,180,199,.25)' }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flex: '0 0 76px' }}>{t.pdp.hoursLabel}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'pre-line' }}>{about.useTime}</span>
                  </div>
                )}
                {about.restDate && (
                  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderTop: '1px solid rgba(185,180,199,.25)' }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', flex: '0 0 76px' }}>{t.pdp.restLabel}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'pre-line' }}>{about.restDate}</span>
                  </div>
                )}
              </section>
            )}

            {/* OTA식 상세 모듈 — 여기서 하는 것 / 이 기운이 키워주는 것 (PO 피드백: 활동·근거 구체화) */}
            {element && <ElementGuide element={element} t={t} />}

            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{t.pdp.quiet}</h2>
            <div style={{ fontSize: 13, color: 'var(--muted-2)', marginBottom: 8 }}>{t.pdp.demo}</div>
            {/* 혼잡 표시 — v2 §1: status는 뉴트럴(잉크 농도), 색으로 의미 전달 금지. 높이+농도가 정보 */}
            <div role="img" aria-label={`${t.pdp.quiet} — ${t.pdp.quietNote}`} style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
              {CROWD.map((h, i) => (
                <div key={DAYS[i]} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: h >= 85 ? 'rgba(28,27,31,.5)' : h <= 40 ? 'rgba(28,27,31,.12)' : 'rgba(28,27,31,.26)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted-2)', marginTop: 4 }}>
              {DAYS.map((d) => <span key={d}>{d}</span>)}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 6 }}>{t.pdp.quietNote}</p>

            {/* 여행자 영상 — 서비스 내 후기가 없으니 외부(YouTube)에서. 썸네일 카드 → 새 탭 (마지막 섹션) */}
            <section style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 2px' }}>{t.pdp.videosTitle}</h2>
              <div style={{ fontSize: 13, color: 'var(--muted-2)', marginBottom: 10 }}>{t.pdp.videosNote}</div>
              {videos.length > 0 ? (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {videos.map((v) => (
                    <a
                      key={v.videoId}
                      href={`https://www.youtube.com/watch?v=${v.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('video_click', { contentId: place.contentId, videoId: v.videoId })}
                      className="glass"
                      style={{ flex: '0 0 auto', width: 200, overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.thumbnail} alt="" width={200} height={112} style={{ display: 'block', width: 200, height: 112, objectFit: 'cover' }} />
                      <div style={{ padding: '8px 10px 10px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>▶ {v.channel}</div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('video_click', { contentId: place.contentId, videoId: null })}
                  className="glass"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', textDecoration: 'none', color: 'inherit' }}
                >
                  <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--color-status-bg)', display: 'grid', placeItems: 'center', fontSize: 14 }}>▶</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.pdp.videosSearch.replace('{name}', place.name.split('(')[0].trim())}</span>
                </a>
              )}
            </section>

            {/* 일정에 담기 (F-5) — #11: 일자 미설정이면 날짜부터 받고, #8: 담은 뒤 페이지 유지+토스트 */}
            {(() => {
              const added = hasItem(place.contentId);
              const doAdd = () => {
                addItem({ contentId: place.contentId, name: place.name, region: place.region, element: element ?? place.primaryElement ?? null });
                track('plan_add', { contentId: place.contentId, region: place.region });
                setToast(true);
              };
              return (
                <div style={{ marginTop: 24 }}>
                  {/* primary CTA = 火 단색 pill (§1: 앱 전체 유일). disabled = 40% opacity(§4) */}
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => {
                      if (!itin.start || !itin.end) { setDraftStart(itin.start); setDraftEnd(itin.end); setDateSheet(true); return; }
                      doAdd();
                    }}
                    style={{
                      width: '100%', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', cursor: added ? 'default' : 'pointer',
                      fontSize: 16, fontWeight: 600, border: 0,
                      background: 'var(--color-text)', color: '#fff',
                      opacity: added ? 0.4 : 1, boxShadow: added ? 'none' : 'var(--shadow-fab)',
                      transition: 'opacity var(--motion-fast)',
                    }}
                  >
                    {added ? `✓ ${t.pdp.added}` : `${t.pdp.addPlan} +`}
                  </button>
                  {added && (
                    <Link href={{ pathname: '/plan', query: backQuery }} style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none' }}>
                      {t.pdp.viewPlan} →
                    </Link>
                  )}

                  {/* #11: 첫 담기 시 여행 일자 입력 바텀시트 */}
                  {dateSheet && (
                    <div role="dialog" aria-label={t.pdp.datePrompt} style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(43,42,51,.35)' }} onClick={() => setDateSheet(false)}>
                      <div className="glass" style={{ width: '100%', maxWidth: 460, borderRadius: '20px 20px 0 0', padding: '20px 22px 28px', background: 'rgba(255,255,255,.92)' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t.pdp.datePrompt}</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                          <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} aria-label={t.plan.start} style={sheetDateInput} />
                          <input type="date" value={draftEnd} min={draftStart || undefined} onChange={(e) => setDraftEnd(e.target.value)} aria-label={t.plan.end} style={sheetDateInput} />
                        </div>
                        <button
                          type="button"
                          disabled={!draftStart || !draftEnd}
                          onClick={() => { setDates(draftStart, draftEnd); setDateSheet(false); doAdd(); }}
                          style={{ width: '100%', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: 0, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#fff', background: 'var(--color-text)', opacity: !draftStart || !draftEnd ? 0.4 : 1, boxShadow: 'var(--shadow-fab)' }}
                        >
                          {t.pdp.dateConfirm}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* #8: 담기 토스트 — 페이지 이동 없이 피드백 */}
                  {toast && (
                    <div role="status" style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 70, background: 'rgba(43,42,51,.9)', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '11px 18px', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-fab)', whiteSpace: 'nowrap' }}>
                      ✓ {t.pdp.addedToast}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 예약하기 — secondary(§1: primary는 잉크뿐). 여기어때 검색 딥링크(F-6 P1) —
                어필리에이트 정산 파라미터는 PO 확정 후 부착, 지금은 검색 연결 + CTR 계측(§8.4) */}
            <button
              type="button"
              onClick={() => {
                track('book_click', { contentId: place.contentId, region: place.region });
                window.open(`https://www.yeogi.com/domestic-accommodations?keyword=${encodeURIComponent(place.name)}`, '_blank', 'noopener');
              }}
              style={{ width: '100%', minHeight: 48, marginTop: 12, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: '1.5px solid rgba(185,180,199,.5)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}
            >
              {t.pdp.book}
            </button>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 8 }}>{t.pdp.bookNote}</p>
          </div>
        </div>
      )}
    </main>
  );
}

const sheetDateInput: React.CSSProperties = {
  flex: 1, minHeight: 44, padding: 12, borderRadius: 'var(--radius-input)', border: '1px solid rgba(185,180,199,.4)',
  fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text)', background: 'var(--color-surface)',
};
