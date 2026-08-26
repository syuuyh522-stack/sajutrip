// PDP 여행자 영상 검색 프록시 — 키 노출 방지 위해 서버에서만 호출(§6.1).
import { NextResponse } from 'next/server';
import { searchTravelVideos } from '../../../lib/videos/youtube';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json({ videos: [] });
  try {
    const videos = await searchTravelVideos(q, 4);
    return NextResponse.json({ count: videos.length, videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
