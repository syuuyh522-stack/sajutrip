// 오행 원소 팔레트 — 공식 디자인 시스템(design-tokens.css §1) 정본 값.
// 원소색은 fill/accent 전용. 텍스트로 쓸 땐 EL_INK(대비 확보, §1.1).
import type { Element } from '../../types/saju';

/** 원소 대표색 (desaturated, fill/accent 전용) */
export const EL_COLOR: Record<Element, string> = {
  wood: '#8FBFA3', fire: '#E8927C', earth: '#E3B873', metal: '#B9B4C7', water: '#4A5578',
};
/** 텍스트/라벨용 대비 확보색 (§1.1) — 밝은 배경(흰/tint) 위 글자 */
export const EL_INK: Record<Element, string> = {
  wood: '#4F7A63', fire: '#C96B4E', earth: '#9A7B3A', metal: '#6E6C7A', water: '#4A5578',
};

/**
 * 원소 fill(EL_COLOR) 위에 얹는 텍스트색 (§1.1 대비 검증).
 * 水만 fill이 어두워(#4A5578) 흰색(≈7:1), 나머지 밝은 fill엔 잉크 블랙(≥5.5:1).
 * ⚠️ EL_INK를 fill 위에 쓰면 水에서 배경=글자색이 되어 안 보임 — 반드시 EL_ON 사용.
 */
export const EL_ON: Record<Element, string> = {
  wood: '#2B2A33', fire: '#2B2A33', earth: '#2B2A33', metal: '#2B2A33', water: '#FFFFFF',
};
/** fill 위 보조 텍스트(설명문)용 — EL_ON의 소프트 버전, opacity 대신 실색 */
export const EL_ON_MUTED: Record<Element, string> = {
  wood: '#3F4A44', fire: '#4A3B36', earth: '#4A4232', metal: '#4B4A55', water: '#DFE3F0',
};

/** 원소 그라디언트 (오브·히어로 카드용) */
export function elGradient(el: Element): string {
  const lift: Record<Element, string> = {
    wood: '#A9D2BC', fire: '#F0AD9A', earth: '#EFCB94', metal: '#CFCBD8', water: '#6B7699',
  };
  return `linear-gradient(135deg, ${EL_COLOR[el]}, ${lift[el]})`;
}
