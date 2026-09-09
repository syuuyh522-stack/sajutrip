// 외부 API 헬스체크 — 서버 전용(§6.1). 실시간 호출(no-store)로 각 API 연결·응답 확인.
// 공모전: 주기적 호출 기록(§1) — /api/cron/ping이 이걸 호출해 로그를 남긴다.

export interface ApiCheck {
  name: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  note?: string;
}

async function once(url: string, validate: (body: string) => boolean): Promise<{ ok: boolean; status: number; note?: string }> {
  const res = await fetch(url, { cache: 'no-store' });
  const body = await res.text();
  const ok = res.ok && validate(body);
  return { ok, status: res.status, note: ok ? undefined : body.slice(0, 140) };
}

// 공공데이터포털 게이트웨이가 간헐적으로 단발 500/타임아웃을 반환함(직접 재현: 재시도 시 정상).
// 최대 3회 시도(600ms 백오프, 예외 포함)로 플래핑 흡수 — 재시도 역시 실시간 호출이라 공모전 요건과 무관.
async function timed(name: string, url: string, validate: (body: string) => boolean): Promise<ApiCheck> {
  const start = Date.now();
  let last: { ok: boolean; status: number; note?: string } = { ok: false, status: 0 };
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((res) => setTimeout(res, 600));
    try {
      last = await once(url, validate);
      if (last.ok) break;
    } catch (e) {
      last = { ok: false, status: 0, note: String(e).slice(0, 140) };
    }
  }
  return { name, ok: last.ok, status: last.status, latencyMs: Date.now() - start, note: last.note };
}

function url(base: string, path: string, params: Record<string, string>): string {
  return `${base}/${path}?${new URLSearchParams(params).toString()}`;
}

const TOUR_COMMON = { MobileOS: 'ETC', MobileApp: 'sajutrip', _type: 'json', numOfRows: '1', pageNo: '1' };

/** 데이터랩 핑용 구간 — 6주 전 하루 (원천 배포 지연 감안) */
function recentWindow(): { startYmd: string; endYmd: string } {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 42);
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  return { startYmd: ymd, endYmd: ymd };
}

/** 앱이 실제로 쓰는 외부 API를 모두 핑 */
export async function checkApis(): Promise<ApiCheck[]> {
  const kasiKey = process.env.KASI_SERVICE_KEY ?? '';
  const kasiLrsr = process.env.KASI_LRSR_BASE ?? 'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
  const kasiSpcde = process.env.KASI_SPCDE_BASE ?? 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';
  const tourKey = process.env.TOURAPI_SERVICE_KEY ?? '';
  const wellness = process.env.TOURAPI_WELLNESS_BASE ?? 'https://apis.data.go.kr/B551011/WellnessTursmService';
  const kor = process.env.TOURAPI_KOR_BASE ?? 'https://apis.data.go.kr/B551011/KorService2';
  const eng = process.env.TOURAPI_ENG_BASE ?? 'https://apis.data.go.kr/B551011/EngService2';
  const durunubi = process.env.TOURAPI_DURUNUBI_BASE ?? 'https://apis.data.go.kr/B551011/Durunubi';
  const datalab = process.env.TOURAPI_DATALAB_BASE ?? 'https://apis.data.go.kr/B551011/DataLabService';

  const tourOk = (b: string) => b.includes('"resultCode":"0000"');

  return Promise.all([
    timed('KASI 음양력정보 (연·일주)', url(kasiLrsr, 'getLunCalInfo', { ServiceKey: kasiKey, solYear: '1996', solMonth: '07', solDay: '22', _type: 'xml' }), (b) => b.includes('<lunIljin>')),
    timed('KASI 24절기 (월주 검증)', url(kasiSpcde, 'get24DivisionsInfo', { ServiceKey: kasiKey, solYear: '2024', solMonth: '07', _type: 'xml' }), (b) => b.includes('<resultCode>00')),
    timed('TourAPI 웰니스 (국문)', url(wellness, 'areaBasedList', { serviceKey: tourKey, ...TOUR_COMMON, langDivCd: 'K' }), tourOk),
    timed('TourAPI 웰니스 (영문)', url(wellness, 'areaBasedList', { serviceKey: tourKey, ...TOUR_COMMON, langDivCd: 'ENG' }), tourOk),
    timed('TourAPI 국문 관광정보', url(kor, 'searchKeyword2', { serviceKey: tourKey, ...TOUR_COMMON, keyword: '온천' }), tourOk),
    timed('TourAPI 영문 관광정보', url(eng, 'searchKeyword2', { serviceKey: tourKey, ...TOUR_COMMON, keyword: 'temple' }), tourOk),
    timed('TourAPI 두루누비 (걷기)', url(durunubi, 'courseList', { serviceKey: tourKey, ...TOUR_COMMON }), tourOk),
    // 혼잡도 근거 — 데이터랩 지역별 방문자수. 원천이 약 5주 지연이라 최근 완결 구간으로 핑한다.
    timed(
      'TourAPI 데이터랩 지역 방문자수 (혼잡도)',
      url(datalab, 'metcoRegnVisitrDDList', { serviceKey: tourKey, ...TOUR_COMMON, ...recentWindow() }),
      tourOk,
    ),
  ]);
}
