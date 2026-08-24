// 오방색 원소 팔레트 (JS에서 참조). CSS 변수와 동일 값. 그라디언트/글리프 헬퍼.
import type { Element } from '../../types/saju';

export const EL_COLOR: Record<Element, string> = {
  wood: '#1E7A6B', fire: '#C6402F', earth: '#C79A3A', metal: '#9AA1A9', water: '#26476B',
};
export const EL_COLOR_2: Record<Element, string> = {
  wood: '#34D399', fire: '#FB7185', earth: '#FBBF24', metal: '#CBD5E1', water: '#818CF8',
};
export const EL_GLYPH: Record<Element, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

/** 원소 그라디언트 (카드·히어로용) */
export function elGradient(el: Element): string {
  return `linear-gradient(135deg, ${EL_COLOR[el]}, ${EL_COLOR_2[el]})`;
}
