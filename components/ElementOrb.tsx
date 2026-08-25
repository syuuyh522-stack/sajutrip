// Element Orb (§5 시그니처) — 유저의 실제 오행 비율이 conic-gradient 스탑 가중치가 되는 구체.
// 파이차트처럼 각지지 않게: 확장된 conic 레이어를 강하게 블러해 색이 안개처럼 섞이는 홀로그래픽 렌더.
// 모션은 느린 앰비언트만(.orb-ambient-motion — reduced-motion 시 토큰 CSS가 비활성).
import type { CSSProperties } from 'react';
import type { Element, ElementDistribution } from '../types/saju';
import { EL_COLOR } from '../lib/ui/elements';

const ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/** 분포(합 6) → conic-gradient 스탑. 경계를 겹치게 잡아 블러와 함께 부드럽게 전이 */
function orbGradient(dist: ElementDistribution): string {
  const total = ORDER.reduce((s, el) => s + dist[el], 0) || 1;
  const stops: string[] = [];
  let acc = 0;
  for (const el of ORDER) {
    const v = dist[el];
    if (v <= 0) continue;
    const mid = ((acc + v / 2) / total) * 360; // 밴드 중심에만 색을 찍고 사이는 자연 보간
    acc += v;
    stops.push(`${EL_COLOR[el]} ${mid.toFixed(1)}deg`);
  }
  // 처음 색으로 닫아 원형 연속성 유지
  if (stops.length > 0) stops.push(stops[0].replace(/ [\d.]+deg$/, ' 360deg'));
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
      style={{
        width: size, height: size, borderRadius: '50%', position: 'relative', flex: '0 0 auto',
        overflow: 'hidden', isolation: 'isolate',
        boxShadow: '0 12px 32px rgba(43,42,51,0.16), inset 0 0 22px rgba(255,255,255,0.5)',
        ...style,
      }}
    >
      {/* 색 레이어 — 확장 + 강블러로 경계가 섞인다 (회전은 이 레이어만) */}
      <span
        aria-hidden="true"
        className="orb-ambient-motion"
        style={{
          position: 'absolute', inset: '-28%', borderRadius: '50%',
          background: orbGradient(distribution),
          filter: `blur(${Math.max(size * 0.16, 14)}px) saturate(1.2)`,
          animation: 'orb-spin 30s linear infinite',
        }}
      />
      {/* 홀로그래픽 하이라이트 + 유리 질감 */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.7), rgba(255,255,255,0) 52%)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 68% 82%, rgba(255,255,255,0.22), rgba(255,255,255,0) 45%)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 -8px 18px rgba(43,42,51,0.10)' }} />
    </div>
  );
}
