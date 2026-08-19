// TourAPI 일반관광(KorService2/EngService2) — 원소별 키워드 검색으로 후보 보강. 서버 전용(§6.1).
// 웰니스가 물·나무 위주라 fire/metal/earth를 여기서 채운다. 검색어가 곧 원소 → 태깅 명확.
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import { AREA_BY_CODE } from '../../config/regions';
import { tagByName } from './tag';
import type { PlaceLocale } from './wellness';

const DEFAULT_KOR = 'https://apis.data.go.kr/B551011/KorService2';
const DEFAULT_ENG = 'https://apis.data.go.kr/B551011/EngService2';
const REVALIDATE = 60 * 60 * 12;

// 로케일별 검색 키워드 (KO=한글, EN=영어 — En은 한글 키워드 커버리지가 낮음).
const ENRICH: Partial<Record<Element, Record<PlaceLocale, string[]>>> = {
  fire: { ko: ['찜질방', '불가마', '한증막'], en: ['jjimjilbang', 'sauna'] },
  metal: { ko: ['사찰', '템플스테이'], en: ['temple', 'templestay'] },
  earth: { ko: ['도자기', '옹기', '머드'], en: ['pottery', 'ceramic', 'mud'] },
};

interface GeneralRaw {
  contentid?: string;
  title?: string;
  addr1?: string;
  firstimage?: string;
  mapx?: string;
  mapy?: string;
  tel?: string;
  areacode?: string;
  sigungucode?: string;
}

async function searchKeyword(locale: PlaceLocale, keyword: string, rows = 20): Promise<GeneralRaw[]> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) return [];
  const base = locale === 'en' ? (process.env.TOURAPI_ENG_BASE ?? DEFAULT_ENG) : (process.env.TOURAPI_KOR_BASE ?? DEFAULT_KOR);
  const qs = new URLSearchParams({
    serviceKey: key,
    numOfRows: String(rows),
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'sajutrip',
    _type: 'json',
    keyword,
    arrange: 'A',
  });
  const realtime = process.env.REALTIME_API_MODE === 'true';
  const res = await fetch(`${base}/searchKeyword2?${qs.toString()}`, realtime ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE } });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const node = (json as { response?: { body?: { items?: { item?: GeneralRaw | GeneralRaw[] } } } })?.response?.body?.items?.item;
  return Array.isArray(node) ? node : node ? [node] : [];
}

function toPlace(raw: GeneralRaw, element: Element, locale: PlaceLocale): Place | null {
  const contentId = raw.contentid ? String(raw.contentid) : '';
  const name = (raw.title ?? '').trim();
  if (!contentId || !name) return null;
  const region = AREA_BY_CODE[String(raw.areacode ?? '')]?.[locale] ?? (locale === 'ko' ? (raw.addr1 ?? '').split(' ')[0] : '');
  return {
    contentId,
    name,
    region: region ?? '',
    image: raw.firstimage || undefined,
    mapX: raw.mapx ? Number(raw.mapx) : undefined,
    mapY: raw.mapy ? Number(raw.mapy) : undefined,
    tel: raw.tel || undefined,
    primaryElement: element,
  };
}

/** 자유 검색 (F-5 P1 검색). 이름/지역 키워드 → 장소. 원소는 이름 기반 태깅(있으면). */
export async function searchPlaces(locale: PlaceLocale, query: string, max = 20): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const raw of await searchKeyword(locale, q, max)) {
    const contentId = raw.contentid ? String(raw.contentid) : '';
    const name = (raw.title ?? '').trim();
    if (!contentId || !name || seen.has(contentId)) continue;
    seen.add(contentId);
    out.push({
      contentId,
      name,
      region: AREA_BY_CODE[String(raw.areacode ?? '')]?.[locale] ?? (locale === 'ko' ? (raw.addr1 ?? '').split(' ')[0] ?? '' : ''),
      image: raw.firstimage || undefined,
      mapX: raw.mapx ? Number(raw.mapx) : undefined,
      mapY: raw.mapy ? Number(raw.mapy) : undefined,
      tel: raw.tel || undefined,
      primaryElement: tagByName(name),
    });
  }
  return out;
}

/** 원소별 보강 후보 (fire/metal/earth). 키워드마다 검색 → contentId 중복 제거. */
export async function getEnrichmentPlaces(element: Element, locale: PlaceLocale): Promise<Place[]> {
  const keywords = ENRICH[element]?.[locale];
  if (!keywords) return [];
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const kw of keywords) {
    for (const raw of await searchKeyword(locale, kw)) {
      const place = toPlace(raw, element, locale);
      if (place && !seen.has(place.contentId)) {
        seen.add(place.contentId);
        out.push(place);
      }
    }
  }
  return out;
}
