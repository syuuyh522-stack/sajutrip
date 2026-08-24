// TourAPI 관광지별 연관 관광지(TarRlteTarService1) — F-5 동선 확장. 서버 전용(§6.1).
// baseYm·areaCd·signguCd 필수. 반환: tAtsNm(기준)·rlteTatsNm(연관)·rlteRank·rlteCtgry.
// 시군구 코드(signguCd)가 있어야 조회 가능 — 웰니스 lDongSignguCd는 포맷이 달라 areaCd만으로 근사.

const DEFAULT_BASE = 'https://apis.data.go.kr/B551011/TarRlteTarService1';
const REVALIDATE = 60 * 60 * 24; // 월 단위 데이터라 길게

export interface RelatedSpot {
  name: string; // 연관 관광지명
  region: string; // 연관 지역(시군구)
  category: string; // 대분류(관광지/자연 등)
  rank: number;
}

interface RelatedRaw {
  rlteTatsNm?: string;
  rlteSignguNm?: string;
  rlteRegnNm?: string;
  rlteCtgryLclsNm?: string;
  rlteRank?: string;
}

/** 최신 기준월(YYYYMM) 후보 — 데이터는 2~3개월 지연될 수 있어 몇 개월 되짚는다. */
function recentMonths(base: string, count = 4): string[] {
  // base = 'YYYYMM' 형태의 기준(예: 배포 시 주입). 여기서는 인자로 받는다.
  const y = Number(base.slice(0, 4));
  const m = Number(base.slice(4, 6));
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const total = y * 12 + (m - 1) - i;
    const yy = Math.floor(total / 12);
    const mm = (total % 12) + 1;
    out.push(`${yy}${String(mm).padStart(2, '0')}`);
  }
  return out;
}

/**
 * 지역(areaCd/signguCd)의 인기 연관 관광지 상위 N. 동선 주변 추천용.
 * @param baseYm 최신 기준월(YYYYMM) — 없으면 데이터 최신월 근사 실패 가능 → 호출측이 주입.
 */
export async function getRelatedSpots(
  areaCd: string,
  signguCd: string,
  baseYm: string,
  max = 6,
): Promise<RelatedSpot[]> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key || !areaCd || !signguCd) return [];
  const base = process.env.TOURAPI_RELATED_BASE ?? DEFAULT_BASE;
  const realtime = process.env.REALTIME_API_MODE === 'true';

  for (const ym of recentMonths(baseYm)) {
    const qs = new URLSearchParams({
      serviceKey: key,
      numOfRows: '20',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'sajutrip',
      _type: 'json',
      baseYm: ym,
      areaCd,
      signguCd,
    });
    try {
      const res = await fetch(`${base}/areaBasedList1?${qs.toString()}`, realtime ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE } });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      const node = (json as { response?: { body?: { items?: { item?: RelatedRaw | RelatedRaw[] } } } })?.response?.body?.items?.item;
      const items = Array.isArray(node) ? node : node ? [node] : [];
      if (items.length === 0) continue;
      const seen = new Set<string>();
      const out: RelatedSpot[] = [];
      for (const r of items) {
        const name = (r.rlteTatsNm ?? '').trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        out.push({
          name,
          region: r.rlteSignguNm ?? r.rlteRegnNm ?? '',
          category: r.rlteCtgryLclsNm ?? '',
          rank: Number(r.rlteRank ?? 0),
        });
        if (out.length >= max) break;
      }
      if (out.length > 0) return out;
    } catch {
      // 다음 기준월 시도
    }
  }
  return [];
}
