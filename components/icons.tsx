// 라인 아이콘 세트 (디자인 시스템 §6: 1.5px stroke, 라운드 캡/조인, 24px 그리드).
// 한자/점술 글리프 금지 — 추상 라인 픽토그램만.
import type { CSSProperties } from 'react';

interface IconProps { size?: number; style?: CSSProperties }

function base(size: number, style?: CSSProperties): CSSProperties {
  return { width: size, height: size, display: 'block', ...style };
}
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** 사주(오행 밸런스) — 스파클/별 */
export function IconSaju({ size = 24, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, style)} aria-hidden="true">
      <path {...stroke} d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path {...stroke} d="M18 15l.7 1.8 1.8.7-1.8.7L18 20l-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}

/** 내 일정(동선) — 경로 라인 + 핀 */
export function IconRoute({ size = 24, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, style)} aria-hidden="true">
      <circle {...stroke} cx="6" cy="6" r="2" />
      <circle {...stroke} cx="18" cy="18" r="2" />
      <path {...stroke} d="M8 6h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h5" />
    </svg>
  );
}

/** 검색 — 돋보기 */
export function IconSearch({ size = 24, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, style)} aria-hidden="true">
      <circle {...stroke} cx="11" cy="11" r="7" />
      <path {...stroke} d="M20 20l-3.2-3.2" />
    </svg>
  );
}

/** 마이 — 사람 */
export function IconUser({ size = 24, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={base(size, style)} aria-hidden="true">
      <circle {...stroke} cx="12" cy="8" r="3.4" />
      <path {...stroke} d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
