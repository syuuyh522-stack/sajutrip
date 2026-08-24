// 장소 데이터 소스 — TourAPI 실데이터(웰니스 + 일반관광 보강) → 실패/미설정 시 로컬 시드 fallback.
// Phase 2에서 Supabase로 교체 시 이 파일만 바뀜(상위 API·화면 불변).
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import { getAllWellness, type PlaceLocale } from '../tour-api/wellness';
import { getEnrichmentPlaces } from '../tour-api/general';
import { getDurunubiCourses } from '../tour-api/durunubi';
import { rankPlaces } from '../recommend/rank';
import { seedByElement, seedById } from './seed';

function tourEnabled(): boolean {
  return Boolean(process.env.TOURAPI_SERVICE_KEY);
}

/** 웰니스 외 보강 소스: 일반관광 키워드(5원소) + 두루누비(wood 걷기).
 *  장소명은 고유명사(데이터) — 영문판에서도 그대로 노출한다(UI 텍스트만 영문 원칙). */
async function getExtraPlaces(element: Element, locale: PlaceLocale): Promise<Place[]> {
  const parts: Promise<Place[]>[] = [getEnrichmentPlaces(element, locale)];
  if (element === 'wood') parts.push(getDurunubiCourses(locale));
  const arrays = await Promise.all(parts);
  return arrays.flat();
}

export async function getPlacesByElement(element: Element, locale: PlaceLocale = 'ko', max = 30): Promise<Place[]> {
  if (tourEnabled()) {
    try {
      // 웰니스(물·나무 위주) + 일반관광 키워드 보강(fire/metal/earth)을 합침
      const [wellness, extra] = await Promise.all([getAllWellness(locale), getExtraPlaces(element, locale)]);
      const matched = wellness.filter((p) => p.primaryElement === element);
      const seen = new Set(matched.map((p) => p.contentId));
      const combined = [...matched, ...extra.filter((p) => !seen.has(p.contentId))];
      if (combined.length > 0) return rankPlaces(combined, element).slice(0, max); // 지방 우대 랭킹(§5.6)
    } catch {
      // TourAPI 실패 시 시드 fallback
    }
  }
  return rankPlaces(seedByElement(element), element).slice(0, max);
}

export async function getPlaceById(contentId: string, locale: PlaceLocale = 'ko', element?: Element): Promise<Place | null> {
  if (tourEnabled()) {
    try {
      const inWellness = (await getAllWellness(locale)).find((p) => p.contentId === contentId);
      if (inWellness) return inWellness;
      // 보강 후보(일반관광)는 원소를 알아야 재조회 가능 — PDP 링크가 element를 전달
      if (element) {
        const inExtra = (await getExtraPlaces(element, locale)).find((p) => p.contentId === contentId);
        if (inExtra) return inExtra;
      }
    } catch {
      // TourAPI 실패 시 시드 fallback
    }
  }
  return seedById(contentId);
}
