// YouTube Data API v3 검색 — PDP '여행자 영상' 섹션. 서버 전용(§6.1).
// 쿼터 절약: search.list=100units/호출, 무료 10,000units/일 → 장소·로케일별 12시간 캐시.
// (KTO API가 아니므로 공모전 실시간 요건 대상 아님 — REALTIME_API_MODE 무관하게 캐시 허용)

export interface TravelVideo {
  videoId: string;
  title: string;
  thumbnail: string; // 320x180 (mqdefault)
  channel: string;
}

interface YtSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
}

/** 장소 키워드로 여행 영상 검색. 키 미설정/실패 시 빈 배열(호출부가 폴백 렌더). */
export async function searchTravelVideos(query: string, max = 4): Promise<TravelVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  const q = query.trim();
  if (!key || !q) return [];
  const qs = new URLSearchParams({
    key,
    part: 'snippet',
    type: 'video',
    q,
    maxResults: String(max),
    safeSearch: 'moderate',
    relevanceLanguage: /[가-힣]/.test(q) ? 'ko' : 'en',
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${qs.toString()}`, {
    next: { revalidate: 60 * 60 * 12 },
  });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const items = (json as { items?: YtSearchItem[] })?.items ?? [];
  const out: TravelVideo[] = [];
  for (const it of items) {
    const videoId = it.id?.videoId;
    const title = it.snippet?.title;
    if (!videoId || !title) continue;
    out.push({
      videoId,
      title,
      thumbnail: it.snippet?.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      channel: it.snippet?.channelTitle ?? '',
    });
  }
  return out;
}
