// 사주 산출용 참조 테이블 (①번 레이어). 근거: PRD F-1, CLAUDE.md §5.2·§6.2.
// 전부 static 상수 — 외부 API 없이 우리가 보유하는 유일한 "사주 데이터".
// 실제 날짜→간지 변환은 이 표를 근거로 KASI 실시간 호출 결과를 해석하는 데 쓴다.

import type { Element, HeavenlyStem, EarthlyBranch } from '../types/saju';
import { HEAVENLY_STEMS } from '../types/saju';

/** ① 천간 → 오행 (갑을木 병정火 무기土 경신金 임계水) */
export const STEM_ELEMENT: Record<HeavenlyStem, Element> = {
  甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth',
  己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water',
};

/** 천간 음양 (P2 정밀 산출 대비) */
export const STEM_YINYANG: Record<HeavenlyStem, 'yang' | 'yin'> = {
  甲: 'yang', 乙: 'yin', 丙: 'yang', 丁: 'yin', 戊: 'yang',
  己: 'yin', 庚: 'yang', 辛: 'yin', 壬: 'yang', 癸: 'yin',
};

/** ② 지지 → 오행 (자水 축土 인묘木 진土 사오火 미土 신유金 술土 해水) */
export const BRANCH_ELEMENT: Record<EarthlyBranch, Element> = {
  子: 'water', 丑: 'earth', 寅: 'wood', 卯: 'wood', 辰: 'earth', 巳: 'fire',
  午: 'fire', 未: 'earth', 申: 'metal', 酉: 'metal', 戌: 'earth', 亥: 'water',
};

/**
 * ③ 24절기 중 '節'(월을 여는 절기)만 → 월지(月支).
 * 中氣(우수·춘분 등)는 월을 바꾸지 않으므로 제외. 節 12개.
 *
 * KASI get24DivisionsInfo 응답은 `dateName`(한글)·`sunLongitude`(태양황경)를 준다.
 * 節 판별은 언어 무관하게 태양황경으로 하는 게 안전: 節 = sunLongitude % 30 === 15.
 * (中氣는 30의 배수: 0·30·60…)
 */
export const SUN_LONGITUDE_TO_MONTH_BRANCH: Record<number, EarthlyBranch> = {
  315: '寅', 345: '卯', 15: '辰', 45: '巳', 75: '午', 105: '未',
  135: '申', 165: '酉', 195: '戌', 225: '亥', 255: '子', 285: '丑',
};

/** KASI dateName(한글 절기명) → 월지 (가독성·검증용 보조 맵) */
export const SOLAR_TERM_KO_TO_MONTH_BRANCH: Record<string, EarthlyBranch> = {
  입춘: '寅', 경칩: '卯', 청명: '辰', 입하: '巳', 망종: '午', 소서: '未',
  입추: '申', 백로: '酉', 한로: '戌', 입동: '亥', 대설: '子', 소한: '丑',
};

/** 節(월을 여는 절기) 여부 — 태양황경 기준. 中氣면 false. */
export function isJeol(sunLongitude: number): boolean {
  return (((sunLongitude % 30) + 30) % 30) === 15;
}

/**
 * ④ 월두법(五虎遁): 연간(年干) → 寅月의 천간 index.
 * 寅月 이후 월마다 천간을 +1 순환시킨다.
 * 甲己年→丙寅 · 乙庚年→戊寅 · 丙辛年→庚寅 · 丁壬年→壬寅 · 戊癸年→甲寅
 * 공식: index = ((연간index % 5) * 2 + 2) % 10
 */
export function firstMonthStemIndex(yearStem: HeavenlyStem): number {
  const y = HEAVENLY_STEMS.indexOf(yearStem);
  return ((y % 5) * 2 + 2) % 10;
}

/**
 * 타깃 오행 동점 시 고정 우선순위 (CLAUDE.md §5.3 결정 지점).
 * 기본값: 상생(相生) 순 木→火→土→金→水. 변경하려면 이 상수만 수정.
 */
export const ELEMENT_PRIORITY: readonly Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
