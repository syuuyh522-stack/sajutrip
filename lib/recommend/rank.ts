// 추천 랭킹 (CLAUDE.md §5.6). 가중치는 config 상수로 관리(튜닝 가능).
// 정렬 우선순위: ① 오행 매칭 강도(primary > attribute/action) ② 비혼잡(집중률 낮을수록)
//   ③ 지역 다양성(지방 우대·편중 감점) ④ 데이터 완성도(이미지·예약링크).
// ②는 데이터랩 방문자수 실시간 조회로 산출한다(lib/tour-api/congestion.ts).
// 혼잡도를 못 받아온 경우에만 수도권 고정 목록으로 대체한다.
import type { Place } from '../../types/place';
import type { Element } from '../../types/saju';
import { REGION_BY_CODE } from '../../config/regions';

// 혼잡도 실데이터가 없을 때만 쓰는 대체 기준(수도권) — 감점. 나머지 지방 = 가점.
const CROWDED_REGIONS = new Set(['서울', '경기', '인천', 'Seoul', 'Gyeonggi', 'Incheon']);

/** 랭킹 가중치 (튜닝 가능) */
export const RANK_WEIGHTS = {
  primaryMatch: 3, // primary_element 매칭
  layerMatch: 1, //   attribute/action 레이어 매칭
  regional: 2, //     지방 가점
  crowdedPenalty: -2, // 편중 지역 감점
  uncrowded: 2.5, //  비혼잡 가점 — (1 - 집중률) × 가중치
  hasImage: 0.5, //   데이터 완성도
} as const;

/** 시도코드 → 혼잡도 0(한산)~1(최고 혼잡) */
export type CongestionMap = Record<string, number>;

function regionName(p: Place): string {
  if (p.regionCode && REGION_BY_CODE[p.regionCode]) return REGION_BY_CODE[p.regionCode].ko;
  return p.region ?? '';
}

function isCrowded(p: Place): boolean {
  const name = regionName(p);
  return [...CROWDED_REGIONS].some((c) => name.includes(c));
}

/** 이 장소의 혼잡도(0~1). 시도코드를 모르거나 실데이터가 없으면 undefined */
export function congestionOf(place: Place, congestion?: CongestionMap): number | undefined {
  if (!congestion || !place.regionCode) return undefined;
  return congestion[place.regionCode];
}

/** 혼잡도 실데이터가 없는 장소의 추정치 — 수도권은 높게, 그 외는 중간 아래로 */
const ASSUMED_CROWD = { crowded: 0.9, other: 0.35 } as const;

export function scorePlace(place: Place, target: Element, congestion?: CongestionMap): number {
  const w = RANK_WEIGHTS;
  const crowded = isCrowded(place);
  let score = 0;
  // ① 오행 매칭 강도
  if (place.primaryElement === target) score += w.primaryMatch;
  else if (place.attributeElement === target || place.actionElement === target) score += w.layerMatch;
  // ② 비혼잡 가점 — 실데이터 우선, 없으면 고정 추정치(장소마다 같은 축으로 채점되도록)
  const crowdLevel = congestionOf(place, congestion) ?? (crowded ? ASSUMED_CROWD.crowded : ASSUMED_CROWD.other);
  score += w.uncrowded * (1 - crowdLevel);
  // ③ 지역 다양성 — 혼잡도와 별개 축(NorthStar = 지방 포함 일정)
  score += crowded ? w.crowdedPenalty : w.regional;
  // ④ 데이터 완성도
  if (place.image) score += w.hasImage;
  return score;
}

/** 지방·비혼잡 우대 정렬. 동점은 원래 순서 유지(stable). */
export function rankPlaces(places: Place[], target: Element, congestion?: CongestionMap): Place[] {
  return places
    .map((p, i) => ({ p, i, s: scorePlace(p, target, congestion) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.p);
}
