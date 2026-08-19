// 사주 오프라인 산출 (KASI 없이 전부 자체계산). K-star 대량 산출·fallback에 사용.
import type { SajuProfile, SajuResult } from '../../types/saju';
import { yearPillar } from './year-pillar';
import { monthPillar } from './month-pillar';
import { dayPillar } from './day-pillar';
import { elementDistribution, deficientElement, excessElement } from './distribution';

export function computeSajuLocal(year: number, month: number, day: number): SajuResult {
  const y = yearPillar(year, month, day);
  const d = dayPillar(year, month, day);
  const m = monthPillar(year, month, day, y.stem);
  const profile: SajuProfile = { year: y, month: m, day: d };
  const distribution = elementDistribution(profile);
  return {
    profile,
    distribution,
    deficient: deficientElement(distribution),
    excess: excessElement(distribution),
  };
}
