// 연주(年柱, 세차) — 입춘(태양황경 315°) 기준. 오프라인 정확 산출, KASI 세차와 일치(검증됨).
//
// ⚠️ KASI lunSecha는 '음력 설' 기준으로 연간지가 바뀐다. 사주 연주는 '입춘' 기준이라
//    입춘~설(또는 설~입춘) 구간 출생자는 KASI 세차와 어긋날 수 있다. → 여기서 입춘 기준 자체 산출.
import type { Pillar } from '../../types/saju';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../../types/saju';
import { sunLongitudeKST } from './solar-longitude';

/** 사주 기준 연도 — 입춘 전이면 전년으로 넘긴다 */
export function sajuYearNumber(year: number, month: number, day: number): number {
  const beforeIpchun = month === 1 || (month === 2 && sunLongitudeKST(year, month, day) < 315);
  return beforeIpchun ? year - 1 : year;
}

/** 연주. 검증: 1996-07-22 → 丙子 (KASI 세차와 일치) */
export function yearPillar(year: number, month: number, day: number): Pillar {
  const y = sajuYearNumber(year, month, day);
  const idx = (((y - 4) % 60) + 60) % 60; // 서기 4년 = 甲子
  return { stem: HEAVENLY_STEMS[idx % 10], branch: EARTHLY_BRANCHES[idx % 12] };
}
