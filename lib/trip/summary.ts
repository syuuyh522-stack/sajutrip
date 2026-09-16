// 여행 요약 — 일정·체크인에서 '이번 여행에 무엇을 했는가'를 뽑는다.
// 순수 함수만 둔다(화면·스토어 의존 없음) → 회귀 테스트 가능.
//
// 서비스 미션이 오버투어리즘 분산(§8.1 NorthStar = 지방 포함 완성 일정)이라
// '지방 몇 곳'이 이 요약의 핵심 숫자다.
import type { Element } from '../../types/saju';
import type { ItineraryState } from '../../types/itinerary';

/** 수도권 — 지방 판정의 여집합. 로케일별 표기를 모두 담는다(region 문자열이 ko/en 혼재) */
const CAPITAL_REGIONS = ['서울', '경기', '인천', 'Seoul', 'Gyeonggi', 'Incheon'] as const;

/** 비수도권인가 — region 표기가 비어 있으면 판정 불가로 보고 false */
export function isRegional(region: string): boolean {
  if (!region) return false;
  return !CAPITAL_REGIONS.some((c) => region.includes(c));
}

export interface TripSummary {
  /** 여행 일수 (start·end 포함). 날짜 미설정이면 0 */
  days: number;
  /** 일정에 담은 곳 */
  planned: number;
  /** 체크인한 곳 */
  visited: number;
  /** 체크인한 곳 중 지방(비수도권) — 미션 지표 */
  regional: number;
  /** 체크인으로 채운 기운 (원소별) */
  byElement: Record<Element, number>;
}

/** YYYY-MM-DD 두 개 → 포함 일수. 순서가 뒤집혔거나 형식이 깨지면 0 */
export function tripDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = Date.parse(`${start}T00:00:00Z`);
  const e = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86_400_000) + 1;
}

/**
 * 여행 요약 산출.
 * @param isVisited 체크인 여부 판정 — ProfileProvider의 isCollected를 넘긴다
 */
export function summarizeTrip(state: ItineraryState, isVisited: (contentId: string) => boolean): TripSummary {
  const byElement: Record<Element, number> = { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 };
  let visited = 0;
  let regional = 0;
  for (const it of state.items) {
    if (!isVisited(it.contentId)) continue;
    visited += 1;
    if (isRegional(it.region)) regional += 1;
    if (it.element) byElement[it.element] += 1;
  }
  return { days: tripDays(state.start, state.end), planned: state.items.length, visited, regional, byElement };
}
