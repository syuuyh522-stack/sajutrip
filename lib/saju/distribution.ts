// 오행 분포 집계 + 타깃 오행(결핍·과잉) 산출. (CLAUDE.md §5.2·§5.3)
import type { SajuProfile, ElementDistribution, Element } from '../../types/saju';
import { STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_PRIORITY } from '../../config/saju-tables';

/** 기둥별 간지 → 오행 카운트. 시주 포함 시 8글자(합 8), 아니면 6글자(합 6) */
export function elementDistribution(profile: SajuProfile): ElementDistribution {
  const dist: ElementDistribution = { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 };
  const pillars = [profile.year, profile.month, profile.day, ...(profile.hour ? [profile.hour] : [])];
  for (const p of pillars) {
    dist[STEM_ELEMENT[p.stem]] += 1;
    dist[BRANCH_ELEMENT[p.branch]] += 1;
  }
  return dist;
}

/** 동점 시 ELEMENT_PRIORITY 순으로 먼저 오는 원소 선택 (§5.3) */
function pick(dist: ElementDistribution, want: 'min' | 'max'): Element {
  let best: Element = ELEMENT_PRIORITY[0];
  for (const el of ELEMENT_PRIORITY) {
    const better = want === 'min' ? dist[el] < dist[best] : dist[el] > dist[best];
    if (better) best = el;
  }
  return best;
}

/** 최다 결핍 — F-5 pre-fill */
export function deficientElement(dist: ElementDistribution): Element {
  return pick(dist, 'min');
}

/** 최다 과잉 — F-3 함께 노출 */
export function excessElement(dist: ElementDistribution): Element {
  return pick(dist, 'max');
}
