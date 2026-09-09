// 장소 데이터 소스 — TourAPI 실데이터(웰니스 + 일반관광 보강) → 실패/미설정 시 로컬 시드 fallback.
// Phase 2에서 Supabase로 교체 시 이 파일만 바뀜(상위 API·화면 불변).
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import { getAllWellness, type PlaceLocale } from '../tour-api/wellness';
import { getEnrichmentPlaces, getPlaceDetail } from '../tour-api/general';
import { getDurunubiCourses } from '../tour-api/durunubi';
import { getRegionCongestion } from '../tour-api/congestion';
import { rankPlaces, type CongestionMap } from '../recommend/rank';
import { seedByElement, seedById } from './seed';

/** 영문 원천이 얇을 때(웰니스 en 93건 vs ko 170건) 국문 소스로 채울 최소 후보 수 */
const EN_TOPUP_THRESHOLD = 12;

function tourEnabled(): boolean {
  return Boolean(process.env.TOURAPI_SERVICE_KEY);
}

/** 타깃 오행과 어느 레이어로든 맞으면 후보 (§5.4 — primary / 속성 / 행위) */
function matchesElement(p: Place, element: Element): boolean {
  return p.primaryElement === element || p.attributeElement === element || p.actionElement === element;
}

/** 웰니스 외 보강 소스: 일반관광 키워드(5원소) + 두루누비(wood 걷기).
 *  장소명은 고유명사(데이터) — 영문판에서도 그대로 노출한다(UI 텍스트만 영문 원칙). */
async function getExtraPlaces(element: Element, locale: PlaceLocale): Promise<Place[]> {
  const parts: Promise<Place[]>[] = [getEnrichmentPlaces(element, locale)];
  if (element === 'wood') parts.push(getDurunubiCourses(locale));
  const arrays = await Promise.all(parts);
  return arrays.flat();
}

/** 혼잡도 조회 — 실패해도 추천은 성립해야 하므로 삼켜서 undefined */
async function safeCongestion(): Promise<CongestionMap | undefined> {
  try {
    return (await getRegionCongestion())?.byRegion;
  } catch {
    return undefined;
  }
}

export async function getPlacesByElement(element: Element, locale: PlaceLocale = 'ko', max = 30): Promise<Place[]> {
  const congestion = tourEnabled() ? await safeCongestion() : undefined;

  if (tourEnabled()) {
    try {
      // 웰니스(물·나무 위주) + 일반관광 키워드 보강(fire/metal/earth)을 합침
      const [wellness, extra] = await Promise.all([getAllWellness(locale), getExtraPlaces(element, locale)]);
      const matched = wellness.filter((p) => matchesElement(p, element));
      const seen = new Set(matched.map((p) => p.contentId));
      const combined = [...matched, ...extra.filter((p) => !seen.has(p.contentId))];

      // 영문 원천이 얇은 원소(대표적으로 火 — EngService2에 sauna/jjimjilbang 검색 결과 0건)는
      // 국문 소스로 보충한다. 장소명은 화면에서 로마자 병기로 표기된다(lib/ui/romanize).
      if (locale === 'en' && combined.length < EN_TOPUP_THRESHOLD) {
        const koSeen = new Set(combined.map((p) => p.contentId));
        const [koWellness, koExtra] = await Promise.all([getAllWellness('ko'), getExtraPlaces(element, 'ko')]);
        for (const p of [...koWellness.filter((x) => matchesElement(x, element)), ...koExtra]) {
          if (!koSeen.has(p.contentId)) {
            koSeen.add(p.contentId);
            combined.push(p);
          }
        }
      }

      if (combined.length > 0) return rankPlaces(combined, element, congestion).slice(0, max); // 비혼잡·지방 우대(§5.6)
    } catch {
      // TourAPI 실패 시 시드 fallback
    }
  }
  return rankPlaces(seedByElement(element), element, congestion).slice(0, max);
}

export async function getPlaceById(contentId: string, locale: PlaceLocale = 'ko', element?: Element): Promise<Place | null> {
  if (tourEnabled()) {
    // 단계별 독립 예외 처리 — 앞 소스가 실패/누락돼도 다음 폴백으로 진행
    // (KTO 웰니스 원천은 배치 갱신으로 contentId가 빠질 수 있음 — 실측 2612889 케이스)
    try {
      const inWellness = (await getAllWellness(locale)).find((p) => p.contentId === contentId);
      if (inWellness) return inWellness;
    } catch { /* 다음 소스로 */ }
    try {
      // 보강 후보(일반관광)는 원소를 알아야 재조회 가능 — PDP 링크가 element를 전달
      if (element) {
        const inExtra = (await getExtraPlaces(element, locale)).find((p) => p.contentId === contentId);
        if (inExtra) return inExtra;
      }
    } catch { /* 다음 소스로 */ }
    try {
      // 검색 결과 등 임의 contentId — detailCommon2 단건 폴백 (검색→PDP 플로우 필수)
      const detail = await getPlaceDetail(contentId, locale);
      if (detail) return detail;
      // 로케일 교차 진입(ko id를 en 화면으로 등) — 반대 로케일 서비스로 재시도
      const other = await getPlaceDetail(contentId, locale === 'ko' ? 'en' : 'ko');
      if (other) return other;
    } catch { /* 시드로 */ }
  }
  return seedById(contentId);
}
