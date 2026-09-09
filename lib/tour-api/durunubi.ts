// TourAPI 두루누비(걷기여행길) — 걷기 코스 = 木(행위 매핑, §4). 서버 전용(§6.1).
// 오퍼레이션: Durunubi/courseList. 한글 데이터(언어 파라미터 없음).
import type { Place } from '../../types/place';
import type { PlaceLocale } from './wellness';

const DEFAULT_BASE = 'https://apis.data.go.kr/B551011/Durunubi';
const REVALIDATE = 60 * 60 * 12;

interface CourseRaw {
  crsIdx?: string;
  crsKorNm?: string;
  sigun?: string;
  crsDstnc?: string;
  crsTotlRqrmHour?: string;
  gpxpath?: string;
}

async function fetchPage(pageNo: number, rows: number): Promise<{ items: CourseRaw[]; total: number }> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) throw new Error('TOURAPI_SERVICE_KEY 미설정');
  const base = process.env.TOURAPI_DURUNUBI_BASE ?? DEFAULT_BASE;
  const qs = new URLSearchParams({
    serviceKey: key,
    numOfRows: String(rows),
    pageNo: String(pageNo),
    MobileOS: 'ETC',
    MobileApp: 'sajutrip',
    _type: 'json',
  });
  const realtime = process.env.REALTIME_API_MODE === 'true';
  const res = await fetch(`${base}/courseList?${qs.toString()}`, realtime ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Durunubi ${res.status}`);
  const json: unknown = await res.json();
  const body = (json as { response?: { body?: { items?: { item?: CourseRaw | CourseRaw[] }; totalCount?: number } } })?.response?.body;
  const node = body?.items?.item;
  const items = Array.isArray(node) ? node : node ? [node] : [];
  return { items, total: Number(body?.totalCount ?? 0) };
}

/** 걷기 코스 전체 → wood 장소. (locale은 시그니처 통일용 — 두루누비는 한글 단일) */
export async function getDurunubiCourses(_locale: PlaceLocale, max = 60): Promise<Place[]> {
  const rows = 100;
  const out: Place[] = [];
  let page = 1;
  let total = Infinity;
  while (out.length < total && page <= 5) {
    const { items, total: t } = await fetchPage(page, rows);
    total = t;
    for (const c of items) {
      const contentId = c.crsIdx ? String(c.crsIdx) : '';
      const name = (c.crsKorNm ?? '').trim();
      if (!contentId || !name) continue;
      out.push({
        contentId,
        name: c.crsDstnc ? `${name} · ${c.crsDstnc}km` : name,
        region: (c.sigun ?? '').split(' ')[0] ?? '',
        category: 'durunubi',
        attributeElement: 'wood', // 속성: 숲길·둘레길 = 木
        actionElement: 'wood', //   행위: 걷기 = 木 (§4 행위 매핑)
        primaryElement: 'wood',
      });
      if (out.length >= max) return out;
    }
    if (items.length === 0) break;
    page += 1;
  }
  return out;
}
