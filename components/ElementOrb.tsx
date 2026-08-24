// Element Orb (§5 시그니처) — 유저의 실제 오행 비율이 conic-gradient 스탑 가중치가 되는 구체.
// 모션은 느린 앰비언트만(.orb-ambient-motion — reduced-motion 시 토큰 CSS가 비활성).
import type { CSSProperties } from 'react';
import type { Element, ElementDistribution } from '../types/saju';
import { EL_COLOR } from '../lib/ui/elements';

const ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/** 분포(합 6) → conic-gradient 스탑 문자열. 값 0인 원소는 밴드 없음(§5: 실비율 반영) */
function orbGradient(dist: ElementDistribution): string {
  const total = ORDER.reduce((s, el) => s + dist[el], 0) || 1;
  const stops: string[] = [];
  let acc = 0;
  for (const el of ORDER) {
    const v = dist[el];
    if (v <= 0) continue;
    const from = (acc / total) * 360;
    acc += v;
    const to = (acc / total) * 360;
    stops.push(`${EL_COLOR[el]} ${from.toFixed(1)}deg ${to.toFixed(1)}deg`);
  }
  return `conic-gradient(from 210deg, ${stops.join(', ')})`;
}

export function ElementOrb({ distribution, size = 132, label, style }: {
  distribution: ElementDistribution;
  size?: number;
  /** 스크린리더용 설명 (예: "Wood 1, Fire 2, …") */
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="orb-ambient-motion"
      style={{
        width: size, height: size, borderRadius: '50%', position: 'relative', flex: '0 0 auto',
        background: orbGradient(distribution),
        filter: 'blur(0.5px) saturate(1.15)',
        boxShadow: '0 12px 32px rgba(43,42,51,0.18), inset 0 0 24px rgba(255,255,255,0.55)',
        animation: 'orb-spin 26s linear infinite',
        ...style,
      }}
    >
      {/* 홀로그래픽 하이라이트 */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: '12%', borderRadius: '50%', background: 'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.75), rgba(255,255,255,0) 58%)' }} />
    </div>
  );
}
