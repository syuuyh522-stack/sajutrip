// F-5 P1 검색 — 장소/지역 키워드. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { searchPlaces } from '../../../lib/tour-api/general';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const q = sp.get('q') ?? '';
  const locale = sp.get('lang') === 'en' ? 'en' : 'ko';
  if (!q.trim() || !process.env.TOURAPI_SERVICE_KEY) {
    return NextResponse.json({ query: q, places: [] });
  }
  try {
    const places = await searchPlaces(locale, q, 20);
    return NextResponse.json({ query: q, count: places.length, places });
  } catch {
    return NextResponse.json({ query: q, places: [] });
  }
}
