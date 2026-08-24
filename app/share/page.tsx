'use client';

// F-5 여행 후 — "채운 기운" 요약 카드를 Canvas로 렌더 → 이미지 저장/공유. (PRD 여행 후)
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { useItinerary } from '../../i18n/ItineraryProvider';
import { useProfile } from '../../i18n/ProfileProvider';
import { track } from '../../lib/analytics/track';
import { Aurora } from '../../components/Aurora';
import type { Dictionary } from '../../i18n/dictionaries';
import type { Element } from '../../types/saju';
import type { ItineraryItem } from '../../types/itinerary';

// 공유 카드(Canvas)용 팔레트 — 공식 원소색. 카드 배경(어두운 남색) 위라 원색 fill 사용.
const ELEMENT_COLOR: Record<Element, string> = {
  wood: '#8FBFA3', fire: '#E8927C', earth: '#E3B873', metal: '#B9B4C7', water: '#6B7699',
};
const GLYPH: Record<Element, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
const ORDER: Element[] = ['fire', 'metal', 'wood', 'earth', 'water'];

const W = 1080;
const H = 1350;

function drawCard(
  ctx: CanvasRenderingContext2D,
  data: { target: Element; items: ItineraryItem[]; start: string; end: string; collectedN: number },
  t: Dictionary,
) {
  // 배경 그라디언트
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#312e81');
  g.addColorStop(1, '#4338CA');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const pad = 90;
  ctx.textBaseline = 'alphabetic';

  // 브랜드 + 날짜
  ctx.fillStyle = '#fff';
  ctx.font = '600 44px -apple-system, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SajuTrip 사주트립', pad, pad + 40);
  if (data.start) {
    ctx.fillStyle = 'rgba(199,210,254,0.9)';
    ctx.font = '400 30px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.fillText([data.start, data.end].filter(Boolean).join(' – '), W - pad, pad + 38);
  }

  // 헤드라인 (간단 줄바꿈)
  ctx.fillStyle = '#fff';
  ctx.font = '600 68px -apple-system, system-ui, sans-serif';
  ctx.textAlign = 'left';
  const headline = t.share.headline.replace('{element}', t.elements[data.target]);
  wrapText(ctx, headline, pad, 360, W - pad * 2, 80);

  // 오행 글리프 5개 (타깃만 채움)
  const tileW = (W - pad * 2 - 40) / 5;
  const tileY = 560;
  ORDER.forEach((el, i) => {
    const x = pad + i * (tileW + 10);
    const on = el === data.target;
    ctx.fillStyle = on ? ELEMENT_COLOR[el] : 'rgba(255,255,255,0.12)';
    roundRect(ctx, x, tileY, tileW, tileW, 22);
    ctx.fill();
    ctx.fillStyle = on ? '#fff' : 'rgba(255,255,255,0.5)';
    ctx.font = '600 64px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(GLYPH[el], x + tileW / 2, tileY + tileW / 2 + 24);
  });

  // "{Element} collected"
  ctx.fillStyle = 'rgba(199,210,254,0.95)';
  ctx.font = '500 34px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  // 실수집 카운트(체크인 기반) — 없으면 담은 장소 수로 폴백
  const n = data.collectedN > 0 ? data.collectedN : data.items.length;
  ctx.fillText(`${t.elements[data.target]} · +${n} ${t.share.collected}`, pad, tileY + tileW + 80);

  // 여정 리스트 (최대 6)
  ctx.font = '400 34px -apple-system, system-ui, sans-serif';
  let y = tileY + tileW + 160;
  data.items.slice(0, 6).forEach((it, i) => {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const line = `${circled(i + 1)} ${it.name}${it.region ? ` · ${it.region}` : ''}`;
    ctx.fillText(truncate(ctx, line, W - pad * 2), pad, y);
    y += 56;
  });

  // 워터마크
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 28px -apple-system, system-ui, sans-serif';
  ctx.fillText('sajutrip', pad, H - pad);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      line = w;
      cy += lh;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(`${s}…`).width > maxW) s = s.slice(0, -1);
  return `${s}…`;
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circled(n: number): string {
  return ['①', '②', '③', '④', '⑤', '⑥'][n - 1] ?? `${n}.`;
}

function ShareInner() {
  const { t } = useI18n();
  const { state } = useItinerary();
  const { collectedCount } = useProfile();
  const params = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<Element | null>(null);

  const birth = useMemo(
    () => ({
      gender: params.get('gender') ?? '', year: params.get('year') ?? '',
      month: params.get('month') ?? '', day: params.get('day') ?? '',
    }),
    [params],
  );

  useEffect(() => {
    if (!birth.year) return;
    fetch(`/api/saju?${new URLSearchParams(birth).toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setTarget(j.deficient))
      .catch(() => setTarget(null));
  }, [birth]);

  // 타깃(결핍) 원소가 정해지면 카드 렌더
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !target) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCard(ctx, { target, items: state.items, start: state.start, end: state.end, collectedN: collectedCount(target) }, t);
  }, [target, state, t, collectedCount]);

  const save = useCallback(() => {
    track('share_action', { kind: 'save' });
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sajutrip.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const share = useCallback(async () => {
    track('share_action', { kind: 'share' });
    const canvas = canvasRef.current;
    if (!canvas || !target) return save();
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'sajutrip.png', { type: 'image/png' });
      const text = t.share.shareText.replace('{element}', t.elements[target]);
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text });
          return;
        } catch {
          /* 취소/미지원 시 저장 */
        }
      }
      save();
    }, 'image/png');
  }, [save, target, t]);

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link href={{ pathname: '/plan', query: birth }} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.share.back}</Link>
      </header>

      <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 16px' }}>{t.share.title}</h1>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ width: '100%', maxWidth: 380, display: 'block', margin: '0 auto', borderRadius: 18, boxShadow: '0 20px 44px -22px rgba(30,41,59,.5)' }}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button type="button" onClick={save} style={{ flex: 1, minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: '1.5px solid rgba(185,180,199,.5)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
          {t.share.save}
        </button>
        {/* primary = 火 pill (§1) */}
        <button type="button" onClick={share} style={{ flex: 1, minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: 0, background: 'var(--color-fire-strong)', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#fff', boxShadow: 'var(--shadow-fab)' }}>
          {t.share.share}
        </button>
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareInner />
    </Suspense>
  );
}
