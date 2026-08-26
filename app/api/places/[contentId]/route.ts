// F-4 PDP 단건 조회. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getPlaceById } from '../../../../lib/places/source';
import { getPlaceAbout } from '../../../../lib/tour-api/general';
import type { Element } from '../../../../types/saju';

export const dynamic = 'force-dynamic';

const ELEMENTS = ['wood', 'fire', 'earth', 'water', 'metal'];

export async function GET(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params; // Next 15: 동적 params는 async
  const sp = new URL(request.url).searchParams;
  const locale = sp.get('lang') === 'en' ? 'en' : 'ko';
  const el = sp.get('element');
  const element = el && ELEMENTS.includes(el) ? (el as Element) : undefined;
  // 장소 본체와 장소별 상세(소개·체험안내·이용시간)를 병렬 조회 — 상세 실패는 무시(부가 정보)
  const [place, about] = await Promise.all([
    getPlaceById(contentId, locale, element),
    getPlaceAbout(contentId, locale),
  ]);
  if (!place) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ place, about });
}
