// F-4 PDP 단건 조회. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getPlaceById } from '../../../../lib/places/source';
import { getPlaceAbout } from '../../../../lib/tour-api/general';
import { getRegionCongestion } from '../../../../lib/tour-api/congestion';
import type { Element } from '../../../../types/saju';

export const dynamic = 'force-dynamic';

const ELEMENTS = ['wood', 'fire', 'earth', 'water', 'metal'];

export async function GET(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params; // Next 15: 동적 params는 async
  const sp = new URL(request.url).searchParams;
  const locale = sp.get('lang') === 'en' ? 'en' : 'ko';
  const el = sp.get('element');
  const element = el && ELEMENTS.includes(el) ? (el as Element) : undefined;
  // 장소 본체 / 장소별 상세(소개·체험안내·이용시간) / 지역 혼잡도를 병렬 조회.
  // 상세·혼잡도 실패는 무시(부가 정보) — 본체만 있으면 PDP는 렌더된다.
  const [place, about, congestion] = await Promise.all([
    getPlaceById(contentId, locale, element),
    getPlaceAbout(contentId, locale),
    getRegionCongestion().catch(() => null),
  ]);
  if (!place) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  // F-4 "몰리는 시간 / 여유로운 시간" — 데이터랩 시도별 요일 방문량 실데이터(§5.5)
  const code = place.regionCode;
  const weekday = code && congestion ? congestion.weekdayByRegion[code] : undefined;
  return NextResponse.json({
    place,
    about,
    congestion: weekday && congestion ? { weekday, period: congestion.period } : null,
  });
}
