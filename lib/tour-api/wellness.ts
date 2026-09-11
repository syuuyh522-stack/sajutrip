// TourAPI 웰니스관광정보 — 서버 전용(§6.1). 로케일별 실데이터(en=ENG / ko=K).
// 오퍼레이션: WellnessTursmService/areaBasedList (버전 없는 v1형, 필수 langDivCd). 실호출 검증.
// 캐시 정책은 lib/tour-api/cache.ts — 기본 실시간(no-store), REALTIME_API_MODE=false일 때만 revalidate(§6.5).
import type { Place } from '../../types/place';
import { REGION_BY_CODE } from '../../config/regions';
import { tagLayers } from './tag';
import { fetchInit } from './cache';

export type PlaceLocale = 'en' | 'ko';

const DEFAULT_BASE = 'https://apis.data.go.kr/B551011/WellnessTursmService';
const REVALIDATE = 60 * 60 * 12; // 12h

interface WellnessRaw {
  contentId?: string;
  title?: string;
  baseAddr?: string;
  firstimage?: string;
  orgImage?: string;
  thumbImage?: string;
  mapX?: string;
  mapY?: string;
  tel?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  wellnessThemaCd?: string;
}

async function fetchPage(locale: PlaceLocale, pageNo: number, rows: number): Promise<{ items: WellnessRaw[]; total: number }> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) throw new Error('TOURAPI_SERVICE_KEY 미설정');
  const base = process.env.TOURAPI_WELLNESS_BASE ?? DEFAULT_BASE;
  const qs = new URLSearchParams({
    serviceKey: key, // URLSearchParams가 1회 인코딩 → data.go.kr 요구와 일치(Decoding 키 저장 전제)
    numOfRows: String(rows),
    pageNo: String(pageNo),
    MobileOS: 'ETC',
    MobileApp: 'sajutrip',
    _type: 'json',
    langDivCd: locale === 'en' ? 'ENG' : 'K',
  });
  const res = await fetch(`${base}/areaBasedList?${qs.toString()}`, fetchInit(REVALIDATE));
  if (!res.ok) throw new Error(`TourAPI ${res.status}`);
  const json: unknown = await res.json();
  const body = (json as { response?: { body?: { items?: { item?: WellnessRaw | WellnessRaw[] }; totalCount?: number } } })?.response?.body;
  const node = body?.items?.item;
  const items = Array.isArray(node) ? node : node ? [node] : [];
  return { items, total: Number(body?.totalCount ?? 0) };
}

function toPlace(raw: WellnessRaw, locale: PlaceLocale): Place | null {
  const contentId = raw.contentId ? String(raw.contentId) : '';
  const name = (raw.title ?? '').trim();
  if (!contentId || !name) return null;
  const code = raw.lDongRegnCd ? String(raw.lDongRegnCd) : '';
  const region = REGION_BY_CODE[code]?.[locale] ?? (raw.baseAddr ?? '').split(' ')[0] ?? '';
  // 속성·행위·종합 3필드를 한 번에 산출 (PRD F-2 3·4단계, §5.4)
  const layers = tagLayers(name, raw.wellnessThemaCd);
  return {
    contentId,
    name,
    region,
    regionCode: raw.lDongRegnCd,
    signguCode: raw.lDongSignguCd,
    category: raw.wellnessThemaCd,
    image: raw.firstimage || raw.orgImage || raw.thumbImage || undefined,
    mapX: raw.mapX ? Number(raw.mapX) : undefined,
    mapY: raw.mapY ? Number(raw.mapY) : undefined,
    tel: raw.tel || undefined,
    // 강한 이름 신호(오분류 보정) → 테마코드 → 이름 키워드 → 속성/행위 (§5.4)
    attributeElement: layers.attribute,
    actionElement: layers.action,
    primaryElement: layers.primary,
  };
}

/** 로케일 웰니스 전체(페이지네이션). fetch 캐시로 반복 호출 시 TourAPI 재호출 없음. */
export async function getAllWellness(locale: PlaceLocale): Promise<Place[]> {
  const rows = 100;
  const out: Place[] = [];
  let page = 1;
  let total = Infinity;
  while (out.length < total && page <= 10) {
    const { items, total: t } = await fetchPage(locale, page, rows);
    total = t;
    for (const raw of items) {
      const place = toPlace(raw, locale);
      if (place) out.push(place);
    }
    if (items.length === 0) break;
    page += 1;
  }
  return out;
}
