// 일주(日柱, 일진) — 60갑자 연속 카운트. 오프라인 정확 산출, KASI 일진과 일치(검증됨).
import type { Pillar } from '../../types/saju';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../../types/saju';
import { julianDay } from './solar-longitude';

/** 60갑자 index(0=甲子) → 간지 */
export function pillarFromSexagenary(idx: number): Pillar {
  const i = ((idx % 60) + 60) % 60;
  return { stem: HEAVENLY_STEMS[i % 10], branch: EARTHLY_BRANCHES[i % 12] };
}

/**
 * 일주(일진). 정수 JDN(정오 기준) + 49 오프셋으로 60갑자 index 산출.
 * 검증: 1996-07-22 → 庚申 (KASI 일진과 일치). 시각 미입력이라 자정 경계는 무시(day 기준).
 */
export function dayPillar(year: number, month: number, day: number): Pillar {
  const jdn = Math.floor(julianDay(year, month, day, 12));
  return pillarFromSexagenary(jdn + 49);
}
