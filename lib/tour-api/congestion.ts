// 한국관광 데이터랩 — 지역별 방문자수(DataLabService/metcoRegnVisitrDDList). 서버 전용(§6.1).
//
// PRD F-2 상세정책: "관광지 집중률/수요강도 API만 매 요청마다 실시간 호출(혼잡도 필터링용)".
// 원래 후보였던 AreaTarDemDsService·tatsCnctrRatedList는 이 인증키로 활용신청이 안 잡혀
// NO_OPENAPI_SERVICE_ERROR가 떨어진다(실호출 확인). 대신 같은 목적을 만족하는
// metcoRegnVisitrDDList(시도별 일자·요일별 방문자수)로 혼잡도를 산출한다.
//  · 응답 areaCode = 법정동 시도코드 → 웰니스 lDongRegnCd와 그대로 조인된다.
//  · 현지인(touDivCd=1)은 제외하고 외지인(2)+외국인(3)만 센다 — 오버투어리즘 관점의 방문 압력.
//
// 캐시: 집중률은 실시간 데이터라 항상 no-store (CLAUDE.md §6.5).
// 원천이 약 5주 지연 배포라 최신 주가 비어 있을 수 있어, 주 단위로 뒤로 물러나며 찾는다.

const DEFAULT_BASE = 'https://apis.data.go.kr/B551011/DataLabService';

/** 요일 코드(1=월 … 7=일) → 배열 index 0..6 */
const WEEKDAY_COUNT = 7;

/** 조회 윈도(일) — 요일별 패턴을 뽑으려면 최소 7일 */
const WINDOW_DAYS = 7;

/** 최신 데이터가 없을 때 뒤로 물러날 주 수 (약 5주 지연 관측 → 12주까지 탐색) */
const MAX_WEEKS_BACK = 12;

export interface RegionCongestion {
  /** 시도코드 → 혼잡도 0(한산)~1(최고 혼잡). 전국 최대값 기준 정규화 */
  byRegion: Record<string, number>;
  /** 시도코드 → 요일별(월~일) 상대 방문량 0~100. PDP 혼잡 그래프용 */
  weekdayByRegion: Record<string, number[]>;
  /** 실제로 집계된 기간 (근거 표기용) */
  period: { start: string; end: string };
}

interface VisitorRaw {
  areaCode?: string;
  areaNm?: string;
  daywkDivCd?: string;
  touDivCd?: string;
  touNum?: string;
  baseYmd?: string;
}

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** n주 전의 7일 윈도 (월요일 정렬 없이 단순 구간) */
function windowFor(weeksBack: number): { start: string; end: string } {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - weeksBack * 7);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (WINDOW_DAYS - 1));
  return { start: ymd(start), end: ymd(end) };
}

async function fetchWindow(start: string, end: string): Promise<VisitorRaw[]> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) throw new Error('TOURAPI_SERVICE_KEY 미설정');
  const base = process.env.TOURAPI_DATALAB_BASE ?? DEFAULT_BASE;
  const qs = new URLSearchParams({
    serviceKey: key, // URLSearchParams가 1회 인코딩 → data.go.kr 요구와 일치(Decoding 키 저장 전제)
    numOfRows: '600', // 18시도 × 7일 × 3구분 = 378행
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'sajutrip',
    _type: 'json',
    startYmd: start,
    endYmd: end,
  });
  // 혼잡도는 실시간 지표 — 캐시하지 않는다(§6.5, 공모전 심사 요건)
  const res = await fetch(`${base}/metcoRegnVisitrDDList?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`DataLab ${res.status}`);
  const json: unknown = await res.json();
  const node = (json as { response?: { body?: { items?: { item?: VisitorRaw | VisitorRaw[] } } } })
    ?.response?.body?.items?.item;
  return Array.isArray(node) ? node : node ? [node] : [];
}

/**
 * 시도별 혼잡도 조회. 실패하거나 데이터가 없으면 null — 호출부는 혼잡 가점 없이 진행한다.
 * (혼잡도는 랭킹 보정용이라 없어도 추천 자체는 성립해야 한다)
 */
export async function getRegionCongestion(): Promise<RegionCongestion | null> {
  // 원천이 약 5주 지연이라 5주 전부터 찾기 시작한다(대개 1회 호출로 끝남)
  for (let weeksBack = 5; weeksBack <= MAX_WEEKS_BACK; weeksBack += 1) {
    const { start, end } = windowFor(weeksBack);
    let rows: VisitorRaw[];
    try {
      rows = await fetchWindow(start, end);
    } catch {
      return null; // 키 미설정·네트워크 실패는 더 뒤져도 같다
    }
    if (rows.length === 0) continue;

    const totals = new Map<string, number>();
    const weekday = new Map<string, number[]>();
    const daysSeen = new Set<number>();
    for (const r of rows) {
      const code = r.areaCode ? String(r.areaCode) : '';
      // 현지인(1) 제외 — 외지인(2)·외국인(3)만이 관광 방문 압력
      if (!code || r.touDivCd === '1') continue;
      const n = Number(r.touNum);
      if (!Number.isFinite(n)) continue;
      totals.set(code, (totals.get(code) ?? 0) + n);
      const dw = Number(r.daywkDivCd);
      if (Number.isInteger(dw) && dw >= 1 && dw <= WEEKDAY_COUNT) {
        daysSeen.add(dw);
        const arr = weekday.get(code) ?? new Array<number>(WEEKDAY_COUNT).fill(0);
        arr[dw - 1] += n;
        weekday.set(code, arr);
      }
    }
    if (totals.size === 0) continue;
    // 원천 배포 끝단에 걸리면 구간이 잘려 일부 요일이 0으로 남는다.
    // 그 상태로 "가장 한산한 요일"을 말하면 거짓이 되므로, 7요일이 다 찬 구간만 채택한다.
    if (daysSeen.size < WEEKDAY_COUNT) continue;

    const max = Math.max(...totals.values());
    const byRegion: Record<string, number> = {};
    for (const [code, v] of totals) byRegion[code] = max > 0 ? v / max : 0;

    // 요일 그래프는 지역 안에서의 '상대' 패턴 — 절대 방문자수는 요일 간 차이가 10% 안쪽이라
    // 그대로 그리면 막대가 전부 같은 높이로 보인다. 지역 내 최소~최대를 15~100으로 펼친다.
    const weekdayByRegion: Record<string, number[]> = {};
    for (const [code, arr] of weekday) {
      const lo = Math.min(...arr);
      const hi = Math.max(...arr);
      const span = hi - lo;
      weekdayByRegion[code] = arr.map((v) => (span > 0 ? Math.round(15 + ((v - lo) / span) * 85) : 50));
    }

    return { byRegion, weekdayByRegion, period: { start, end } };
  }
  return null;
}
