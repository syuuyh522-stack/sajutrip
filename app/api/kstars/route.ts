// K-star 랭킹 (F-2 더보기) — 궁합·같은 기운 각 상위 11 (1위 + 10명). 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { computeSaju } from '../../../lib/saju';
import { rankSoulmates, rankTwins } from '../../../lib/saju/kstar';
import { KSTARS } from '../../../config/kstars';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const year = Number(sp.get('year'));
  const month = Number(sp.get('month'));
  const day = Number(sp.get('day'));
  const hourRaw = sp.get('hour');
  const hour = hourRaw === null || hourRaw === '' ? undefined : Number(hourRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }
  try {
    const result = await computeSaju(year, month, day, { hour });
    return NextResponse.json({
      deficient: result.deficient,
      excess: result.excess,
      soulmates: rankSoulmates(result, KSTARS, 11),
      twins: rankTwins(result, KSTARS, 11),
    });
  } catch {
    return NextResponse.json({ error: 'compute_failed' }, { status: 502 });
  }
}
