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

// 로케일별 검색 키워드 (KO=한글, EN=영어). 웰니스가 못 채우는 '장소 타입 다양성'을
// 일반관광(KorService2/EngService2)에서 보강 — 5원소 전체 (§5.4 레이어·다양성).
const ENRICH: Partial<Record<Element, Record<PlaceLocale, string[]>>> = {
  water: { ko: ['계곡', '해수욕장', '호수', '폭포'], en: ['valley', 'beach', 'lake', 'waterfall'] },
  wood: { ko: ['수목원', '자연휴양림', '둘레길', '숲길'], en: ['arboretum', 'forest', 'trail'] },
  fire: { ko: ['찜질방', '불가마', '한증막'], en: ['jjimjilbang', 'sauna'] },
  metal: { ko: ['사찰', '템플스테이'], en: ['temple', 'templestay'] },
  earth: { ko: ['도자기', '옹기', '머드', '갯벌'], en: ['pottery', 'ceramic', 'mud'] },
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

/** 단건 상세 (detailCommon2) — 검색 결과 등 임의 contentId의 PDP 폴백 조회. 원소는 이름 태깅. */
export async function getPlaceDetail(contentId: string, locale: PlaceLocale): Promise<Place | null> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key || !contentId) return null;
  const base = locale === 'en' ? (process.env.TOURAPI_ENG_BASE ?? DEFAULT_ENG) : (process.env.TOURAPI_KOR_BASE ?? DEFAULT_KOR);
  const qs = new URLSearchParams({
    serviceKey: key, MobileOS: 'ETC', MobileApp: 'sajutrip', _type: 'json', contentId,
  });
  const realtime = process.env.REALTIME_API_MODE === 'true';
  const res = await fetch(`${base}/detailCommon2?${qs.toString()}`, realtime ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE } });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  const node = (json as { response?: { body?: { items?: { item?: GeneralRaw | GeneralRaw[] } } } })?.response?.body?.items?.item;
  const raw = Array.isArray(node) ? node[0] : node;
  if (!raw) return null;
  const name = (raw.title ?? '').trim();
  if (!name) return null;
  return {
    contentId,
    name,
    region: AREA_BY_CODE[String(raw.areacode ?? '')]?.[locale] ?? (locale === 'ko' ? (raw.addr1 ?? '').split(' ')[0] ?? '' : ''),
    image: raw.firstimage || undefined,
    tel: raw.tel || undefined,
    primaryElement: tagByName(name),
  };
}

/** 장소별 추가 정보 (PDP About) — detailCommon2 overview + detailIntro2 체험안내·이용시간·휴무 */
export interface PlaceAbout {
  overview?: string;
  expGuide?: string;
  useTime?: string;
  restDate?: string;
}

/** HTML 태그·엔티티 정리 (overview 원문에 <br>·&ldquo; 등이 섞여 옴) */
function cleanText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&lsquo;|&rsquo;|&#39;/g, "'")
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchTourJson(base: string, op: string, params: Record<string, string>): Promise<Record<string, string> | null> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) return null;
  const qs = new URLSearchParams({ serviceKey: key, MobileOS: 'ETC', MobileApp: 'sajutrip', _type: 'json', ...params });
  const realtime = process.env.REALTIME_API_MODE === 'true';
  const res = await fetch(`${base}/${op}?${qs.toString()}`, realtime ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE } });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  const node = (json as { response?: { body?: { items?: { item?: unknown } } } })?.response?.body?.items?.item;
  const raw = Array.isArray(node) ? node[0] : node;
  return raw && typeof raw === 'object' ? (raw as Record<string, string>) : null;
}

/** PDP용 장소별 소개·체험안내·이용시간 (같은 로케일 서비스의 contentId 기준) */
export async function getPlaceAbout(contentId: string, locale: PlaceLocale): Promise<PlaceAbout> {
  const base = locale === 'en' ? (process.env.TOURAPI_ENG_BASE ?? DEFAULT_ENG) : (process.env.TOURAPI_KOR_BASE ?? DEFAULT_KOR);
  const out: PlaceAbout = {};
  try {
    const common = await fetchTourJson(base, 'detailCommon2', { contentId });
    if (common?.overview) out.overview = cleanText(common.overview);
    const typeId = common?.contenttypeid;
    if (typeId) {
      const intro = await fetchTourJson(base, 'detailIntro2', { contentId, contentTypeId: typeId });
      if (intro) {
        // 타입별 필드명이 다름 — 존재하는 첫 값을 채택 (관광지 expguide/usetime/restdate, 축제 program/playtime 등)
        const first = (keys: string[]) => keys.map((k) => intro[k]).find((v) => v && String(v).trim());
        const exp = first(['expguide', 'program', 'theme']);
        const use = first(['usetime', 'playtime', 'usetimeculture', 'opentimefood', 'usetimeleports']);
        const rest = first(['restdate', 'restdateculture', 'restdatefood', 'restdateleports']);
        if (exp) out.expGuide = cleanText(String(exp));
        if (use) out.useTime = cleanText(String(use));
        if (rest) out.restDate = cleanText(String(rest));
      }
    }
  } catch {
    // 상세 정보는 부가 — 실패해도 PDP 본체는 렌더
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
