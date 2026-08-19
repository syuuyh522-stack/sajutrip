// F-3 장소 추천 조회. 소스(Airtable/시드) 추상화는 lib/places/source. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getPlacesByElement } from '../../../lib/places/source';
import type { Element } from '../../../types/saju';

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'water', 'metal'];

function isElement(v: string | null): v is Element {
  return v !== null && (ELEMENTS as string[]).includes(v);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const element = searchParams.get('element');
  if (!isElement(element)) {
    return NextResponse.json({ error: 'invalid_element' }, { status: 400 });
  }
  const locale = searchParams.get('lang') === 'en' ? 'en' : 'ko';
  const max = Number(searchParams.get('max')) || 30;
  const places = await getPlacesByElement(element, locale, max);
  return NextResponse.json({ element, locale, count: places.length, places });
}
