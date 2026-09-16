'use client';

// 여행 요약(보고서) — 완료한 여행에 무엇을 했는지 한 카드로.
//
// 서비스 미션이 오버투어리즘 분산(§8.1 NorthStar = 지방 포함 완성 일정)인데,
// 지금까지 그 숫자가 계측 DB에만 있고 화면 어디에도 안 보였다. 여기서 드러낸다.
// '지방 N곳'을 가장 크게 두는 이유다.
import { summarizeTrip } from '../lib/trip/summary';
import { EL_COLOR, EL_INK } from '../lib/ui/elements';
import type { Dictionary } from '../i18n/dictionaries';
import type { Element } from '../types/saju';
import type { ItineraryState } from '../types/itinerary';

const ORDER: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export function TripSummary({
  state,
  isVisited,
  t,
}: {
  state: ItineraryState;
  isVisited: (contentId: string) => boolean;
  t: Dictionary;
}) {
  const s = summarizeTrip(state, isVisited);
  const filled = ORDER.filter((el) => s.byElement[el] > 0);

  return (
    <section className="glass" style={{ padding: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>{t.tripSummary.title}</h2>

      {/* 숫자 3개 — 지방을 accent로 강조(미션 지표) */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Stat value={s.days} label={t.tripSummary.days} />
        <Stat value={s.visited} label={t.tripSummary.visited} />
        <Stat value={s.regional} label={t.tripSummary.regional} accent />
      </div>

      {filled.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{t.tripSummary.filled}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {filled.map((el) => (
              <span
                key={el}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: EL_INK[el],
                  background: `${EL_COLOR[el]}40`, borderRadius: 'var(--radius-pill)', padding: '5px 11px',
                }}
              >
                {t.elements[el]}
                <span style={{ fontFamily: 'var(--font-mono)' }}>+{s.byElement[el]}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '16px 0 0' }}>{t.tripSummary.empty}</p>
      )}
    </section>
  );
}

/** 숫자 한 칸 — 큰 숫자 + 짧은 라벨. */
function Stat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div
      style={{
        flex: 1, minWidth: 0, textAlign: 'center', padding: '12px 6px', borderRadius: 'var(--radius-input)',
        background: accent ? 'var(--accent-soft)' : 'rgba(185,180,199,.14)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: accent ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
    </div>
  );
}
