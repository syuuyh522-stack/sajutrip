// TourAPI 축제(searchFestival2, KorService2/EngService2) — 검색홈 '이번 주 진행중인 축제' (PRD 검색홈 P1).
// 시의성 데이터라 항상 실시간 호출(no-store). 서버 전용(§6.1).
import type { PlaceLocale } from './wellness';

const DEFAULT_KOR = 'https://apis.data.go.kr/B551011/KorService2';
const DEFAULT_ENG = 'https://apis.data.go.kr/B551011/EngService2';

export interface Festival {
  contentId: string;
  name: string;
  region: string;
  start: string; // YYYYMMDD
  end: string;   // YYYYMMDD
  image?: string;
}

interface FestivalRaw {
  contentid?: string;
  title?: string;
  addr1?: string;
  eventstartdate?: string;
  eventenddate?: string;
  firstimage?: string;
}

/** addr1 → 짧은 지역 표기. ko=첫 토큰(시/도), en=마지막 콤마 구획(…, Gyeonggi-do) */
function regionFromAddr(addr: string, locale: PlaceLocale): string {
  const a = addr.trim();
  if (!a) return '';
  if (locale === 'ko') return a.split(' ')[0] ?? '';
  const parts = a.split(',').map((s) => s.trim());
  return parts[parts.length - 1] ?? '';
}

/** 오늘 기준 진행중·임박 축제 (eventStartDate=오늘 → API가 진행중+예정 반환) */
export async function getFestivals(locale: PlaceLocale, max = 8): Promise<Festival[]> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) return [];
  const base = locale === 'en' ? (process.env.TOURAPI_ENG_BASE ?? DEFAULT_ENG) : (process.env.TOURAPI_KOR_BASE ?? DEFAULT_KOR);
  const now = new Date();
  const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const qs = new URLSearchParams({
    serviceKey: key,
    numOfRows: String(max),
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'sajutrip',
    _type: 'json',
    eventStartDate: today,
    arrange: 'A',
  });
  const res = await fetch(`${base}/searchFestival2?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const node = (json as { response?: { body?: { items?: { item?: FestivalRaw | FestivalRaw[] } } } })?.response?.body?.items?.item;
  const raws = Array.isArray(node) ? node : node ? [node] : [];
  const out: Festival[] = [];
  for (const raw of raws) {
    const contentId = raw.contentid ? String(raw.contentid) : '';
    const name = (raw.title ?? '').trim();
    if (!contentId || !name) continue;
    out.push({
      contentId,
      name,
      region: regionFromAddr(raw.addr1 ?? '', locale),
      start: raw.eventstartdate ?? '',
      end: raw.eventenddate ?? '',
      image: raw.firstimage || undefined,
    });
  }
  return out;
}
