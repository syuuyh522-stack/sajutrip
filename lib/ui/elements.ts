// 오행 원소 팔레트 — 공식 디자인 시스템(design-tokens.css §1) 정본 값.
// 원소색은 fill/accent 전용. 텍스트로 쓸 땐 EL_INK(대비 확보, §1.1).
import type { Element } from '../../types/saju';

/** 원소 대표색 (desaturated, fill/accent 전용) */
export const EL_COLOR: Record<Element, string> = {
  wood: '#8FBFA3', fire: '#E8927C', earth: '#E3B873', metal: '#B9B4C7', water: '#4A5578',
};
/** 텍스트/라벨용 대비 확보색 (§1.1) — 파스텔 위 또는 배경 위 글자 */
export const EL_INK: Record<Element, string> = {
  wood: '#4F7A63', fire: '#C96B4E', earth: '#9A7B3A', metal: '#6E6C7A', water: '#4A5578',
};

/** 원소 그라디언트 (오브·히어로 카드용) */
export function elGradient(el: Element): string {
  const lift: Record<Element, string> = {
    wood: '#A9D2BC', fire: '#F0AD9A', earth: '#EFCB94', metal: '#CFCBD8', water: '#6B7699',
  };
  return `linear-gradient(135deg, ${EL_COLOR[el]}, ${lift[el]})`;
}
