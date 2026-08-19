// F-4 PDP 단건 조회. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getPlaceById } from '../../../../lib/places/source';
import type { Element } from '../../../../types/saju';

export const dynamic = 'force-dynamic';

const ELEMENTS = ['wood', 'fire', 'earth', 'water', 'metal'];

export async function GET(request: Request, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params; // Next 15: 동적 params는 async
  const sp = new URL(request.url).searchParams;
  const locale = sp.get('lang') === 'en' ? 'en' : 'ko';
  const el = sp.get('element');
  const element = el && ELEMENTS.includes(el) ? (el as Element) : undefined;
  const place = await getPlaceById(contentId, locale, element);
  if (!place) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ place });
}
