// 검색홈 '이번 주 진행중인 축제' — searchFestival2 실시간(no-store). 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getFestivals } from '../../../lib/tour-api/festival';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const locale = sp.get('lang') === 'en' ? 'en' : 'ko';
  if (!process.env.TOURAPI_SERVICE_KEY) return NextResponse.json({ festivals: [] });
  try {
    const festivals = await getFestivals(locale, 8);
    return NextResponse.json({ count: festivals.length, festivals });
  } catch {
    return NextResponse.json({ festivals: [] });
  }
}
