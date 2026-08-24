// 추천 랭킹 (CLAUDE.md §5.6). 가중치는 config 상수로 관리(튜닝 가능).
// 정렬 우선순위: ① 오행 매칭 강도(primary > attribute/action) ② 비혼잡(집중률 낮을수록)
//   ③ 지역 다양성(지방 우대·편중 감점) ④ 데이터 완성도(이미지·예약링크).
// POC 현재: 집중률 실데이터 없음 → ①③④로 랭크(NorthStar=지방 포함 일정 직결).
import type { Place } from '../../types/place';
import { REGION_BY_CODE } from '../../config/regions';

// 편중 지역(수도권) — 감점. 나머지 지방 = 가점.
const CROWDED_REGIONS = new Set(['서울', '경기', '인천', 'Seoul', 'Gyeonggi', 'Incheon']);

/** 랭킹 가중치 (튜닝 가능) */
export const RANK_WEIGHTS = {
  primaryMatch: 3, // primary_element 매칭
  layerMatch: 1, //   attribute/action 레이어 매칭
  regional: 2, //     지방 가점
  crowdedPenalty: -2, // 편중 지역 감점
  hasImage: 0.5, //   데이터 완성도
} as const;

function regionName(p: Place): string {
  if (p.regionCode && REGION_BY_CODE[p.regionCode]) return REGION_BY_CODE[p.regionCode].ko;
  return p.region ?? '';
}

function isCrowded(p: Place): boolean {
  const name = regionName(p);
  return [...CROWDED_REGIONS].some((c) => name.includes(c));
}

export function scorePlace(place: Place, target: import('../../types/saju').Element): number {
  const w = RANK_WEIGHTS;
  let score = 0;
  // ① 오행 매칭 강도
  if (place.primaryElement === target) score += w.primaryMatch;
  else if (place.attributeElement === target || place.actionElement === target) score += w.layerMatch;
  // ③ 지역 다양성 (지방 우대 / 편중 감점)
  score += isCrowded(place) ? w.crowdedPenalty : w.regional;
  // ④ 데이터 완성도
  if (place.image) score += w.hasImage;
  return score;
}

/** 지방 우대 정렬. 동점은 원래 순서 유지(stable). */
export function rankPlaces(places: Place[], target: import('../../types/saju').Element): Place[] {
  return places
    .map((p, i) => ({ p, i, s: scorePlace(p, target) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.p);
}
