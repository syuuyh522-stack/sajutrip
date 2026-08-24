// 오행 원소 팔레트 — 몽환적 파스텔 (globals.css 토큰과 동일). 그라디언트/글리프 헬퍼.
import type { Element } from '../../types/saju';

/** 파스텔 대표색 (배경·막대) */
export const EL_COLOR: Record<Element, string> = {
  wood: '#6EE7B7', fire: '#FDA4AF', earth: '#FCD34D', metal: '#C7D2E4', water: '#A5B4FC',
};
/** 파스텔 밝은색 (그라디언트 끝) */
export const EL_COLOR_2: Record<Element, string> = {
  wood: '#A7F3D0', fire: '#FECDD3', earth: '#FDE68A', metal: '#E2E8F0', water: '#C7D2FE',
};
/** 진한 잉크색 — 텍스트/대비용 (파스텔 배경 위 글자) */
export const EL_INK: Record<Element, string> = {
  wood: '#047857', fire: '#BE123C', earth: '#B45309', metal: '#64748B', water: '#4338CA',
};
export const EL_GLYPH: Record<Element, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

/** 원소 파스텔 그라디언트 (카드·히어로용) */
export function elGradient(el: Element): string {
  return `linear-gradient(135deg, ${EL_COLOR[el]}, ${EL_COLOR_2[el]})`;
}
