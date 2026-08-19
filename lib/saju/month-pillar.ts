// 월주(月柱) 산출 — 태양황경으로 월지 결정 + 월두법으로 월간. KASI 없이 전 연도 대응.
// 검증: 1996-07-22(丙子년) → 태양황경 ~120° → 未월, 월두 丙辛年→庚寅頭 → 乙未월. (CLAUDE.md §5.2)

import type { EarthlyBranch, HeavenlyStem, Pillar } from '../../types/saju';
import { HEAVENLY_STEMS } from '../../types/saju';
import { firstMonthStemIndex } from '../../config/saju-tables';
import { sunLongitudeKST } from './solar-longitude';

/** 월지 순서: 寅(입춘 315°)부터 30°씩 12개 */
const MONTH_BRANCH_ORDER: readonly EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑',
];

/** 태양황경 → 월 순번 (0=寅월 … 11=丑월). 입춘 315°가 기준점 */
export function monthIndexFromLongitude(lon: number): number {
  return Math.floor(((((lon - 315) % 360) + 360) % 360) / 30);
}

/** 연간(年干) + 월 순번 → 월간(月干): 월두법(五虎遁) */
export function monthStem(yearStem: HeavenlyStem, monthIdx: number): HeavenlyStem {
  const idx = (firstMonthStemIndex(yearStem) + monthIdx) % 10;
  return HEAVENLY_STEMS[idx];
}

/** 양력 생년월일 + 연간(KASI 세차에서 획득) → 월주 */
export function monthPillar(
  year: number,
  month: number,
  day: number,
  yearStem: HeavenlyStem,
): Pillar {
  const lon = sunLongitudeKST(year, month, day);
  const mi = monthIndexFromLongitude(lon);
  return { stem: monthStem(yearStem, mi), branch: MONTH_BRANCH_ORDER[mi] };
}
