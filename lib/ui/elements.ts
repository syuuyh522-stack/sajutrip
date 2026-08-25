// 오행 원소 팔레트 — 공식 디자인 시스템 v2(design-tokens.css §1) 정본 값.
// 원소색(luminous pastel)은 fill/decoration 전용. 텍스트·숫자 라벨은 반드시 EL_INK(-strong, §1.1).
// ⚠️ 5색 동시 노출은 Orb·분포 차트(§7.1)에서만. 그 외 화면은 한 번에 1개 hue, 작은 태그로만(§1).
import type { Element } from '../../types/saju';

/** 원소 대표색 (luminous glassy pastel, fill 전용 — 텍스트 금지 §1.1) */
export const EL_COLOR: Record<Element, string> = {
  wood: '#5FE0A8', fire: '#FF9B85', earth: '#FFC768', metal: '#B9A4F7', water: '#7CB4F8',
};
/** 텍스트/숫자 라벨용 -strong 변형 (§1.1 AA 검증: 4.9~7.3:1) */
export const EL_INK: Record<Element, string> = {
  wood: '#0F7A4C', fire: '#C64328', earth: '#9C6B0A', metal: '#5A3FB0', water: '#2C63B0',
};

/**
 * 원소 fill(EL_COLOR) 위 텍스트색. v2 파스텔은 전부 밝아서(水 포함) 잉크 텍스트로 통일.
 * (v1의 어두운 水 fill 특례는 폐지 — 흰 글자 쓰지 말 것)
 */
export const EL_ON: Record<Element, string> = {
  wood: '#1C1B1F', fire: '#1C1B1F', earth: '#1C1B1F', metal: '#1C1B1F', water: '#1C1B1F',
};
/** fill 위 보조 텍스트(설명문)용 — 잉크의 소프트 톤 */
export const EL_ON_MUTED: Record<Element, string> = {
  wood: '#37473F', fire: '#4A3833', earth: '#4A4030', metal: '#3E3853', water: '#31405A',
};

/** 원소 그라디언트 (오브·히어로 카드용 — 파스텔에 백색광 리프트) */
export function elGradient(el: Element): string {
  const lift: Record<Element, string> = {
    wood: '#A8F0CE', fire: '#FFC4B5', earth: '#FFDEA4', metal: '#D6C9FB', water: '#B0D2FB',
  };
  return `linear-gradient(135deg, ${EL_COLOR[el]}, ${lift[el]})`;
}
