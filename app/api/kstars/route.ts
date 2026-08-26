// K-star 랭킹 (F-2 더보기) — 궁합·같은 기운 각 상위 11 (1위 + 10명). 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { computeSaju } from '../../../lib/saju';
import { rankSoulmates, rankTwins } from '../../../lib/saju/kstar';
import { attachImages } from '../../../lib/saju/kstar-image';
import { KSTARS } from '../../../config/kstars';

export const dynamic = 'force-dynamic';

const WIKI_BY_NAME = new Map(KSTARS.filter((s) => s.wiki).map((s) => [s.name, s.wiki as string]));


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
    // 사진(위키미디어) 병렬 부착 — 실패한 항목은 원소색 아바타 폴백
    const [soulmates, twins] = await Promise.all([
      attachImages(rankSoulmates(result, KSTARS, 11), WIKI_BY_NAME),
      attachImages(rankTwins(result, KSTARS, 11), WIKI_BY_NAME),
    ]);
    return NextResponse.json({ deficient: result.deficient, excess: result.excess, soulmates, twins });
  } catch {
    return NextResponse.json({ error: 'compute_failed' }, { status: 502 });
  }
}
