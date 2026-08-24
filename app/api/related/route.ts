// F-5 동선 — 특정 지역의 연관 관광지 추천. 서버 전용(§6.1).
import { NextResponse } from 'next/server';
import { getRelatedSpots } from '../../../lib/tour-api/related';

export const dynamic = 'force-dynamic';

// 데이터 최신 기준월 근사(배포 시 env로 갱신 가능). 미설정 시 코드 상수.
const BASE_YM = process.env.TOURAPI_RELATED_BASEYM ?? '202607';

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const areaCd = sp.get('areaCd') ?? '';
  const signguCd = sp.get('signguCd') ?? '';
  if (!areaCd || !signguCd) {
    return NextResponse.json({ spots: [] });
  }
  try {
    const spots = await getRelatedSpots(areaCd, signguCd, BASE_YM, 6);
    return NextResponse.json({ areaCd, signguCd, count: spots.length, spots });
  } catch {
    return NextResponse.json({ spots: [] });
  }
}
